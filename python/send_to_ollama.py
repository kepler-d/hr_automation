import sys
import json
import requests
import re
import os

def get_ollama_url():
    # Inside docker compose, n8n connects to ollama at http://ollama:11434
    # For local CLI tests outside docker, we fallback to http://localhost:11434
    url = "http://ollama:11434/api/generate"
    try:
        # Check if running outside Docker (for local developer validation testing)
        requests.get("http://ollama:11434", timeout=1)
    except requests.exceptions.RequestException:
        url = "http://localhost:11434/api/generate"
    return url

def get_ats_score(resume_text, job_description):
    url = get_ollama_url()
    prompt = f"""
    You are an ATS (Applicant Tracking System). Compare this resume against the job description.
    
    Return ONLY a JSON with this structure:
    {{
      "ats_score": 0-100,
      "matched_keywords": ["python", "docker", ...],
      "missing_keywords": ["kubernetes", "aws", ...],
      "match_summary": "one line explanation"
    }}
    
    Job Description: {job_description}
    Resume: {resume_text}
    """
    
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=90)
        response.raise_for_status()
        result = response.json()
        response_text = result.get("response", "").strip()
        
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(response_text)
    except Exception as e:
        return {
            "ats_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "match_summary": f"ATS evaluation error: {str(e)}"
        }

def query_ollama_screener(job_role, resume_text, job_description=None):
    url = get_ollama_url()
    jd_clause = f"\nJob Description Requirements:\n{job_description}\n" if job_description else ""
    
    prompt = f"""You are an expert HR recruiter. Evaluate this resume for the role of {job_role}.{jd_clause}
    Score the candidate from 0 to 100 based on:
    - Skills match (40 points)
    - Years of relevant experience (30 points)
    - Education (20 points)
    - Communication quality of resume (10 points)
    Respond ONLY in JSON: {{ "score": score, "reason": "...", "skills_matched": [...], "missing_skills": [...] }}
    Resume: {resume_text}"""

    payload = {
        "model": "llama3",
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=90)
        response.raise_for_status()
        result = response.json()
        response_text = result.get("response", "").strip()
        
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return json.loads(response_text)
    except Exception as e:
        return {
            "score": 0,
            "reason": f"AI screener error: {str(e)}",
            "skills_matched": [],
            "missing_skills": []
        }

def main():
    job_role = os.environ.get("JOB_ROLE")
    resume_text = os.environ.get("RESUME_TEXT")
    job_description = os.environ.get("JOB_DESCRIPTION")
    
    if not job_role or not resume_text:
        if len(sys.argv) >= 3:
            job_role = sys.argv[1]
            resume_text = sys.argv[2]
            if len(sys.argv) >= 4:
                job_description = sys.argv[3]
        else:
            try:
                stdin_data = sys.stdin.read().strip()
                if stdin_data:
                    input_json = json.loads(stdin_data)
                    job_role = input_json.get("job_role", "")
                    resume_text = input_json.get("resume_text", "")
                    job_description = input_json.get("job_description", "")
                else:
                    raise ValueError("No stdin data, command arguments, or env variables provided")
            except Exception as e:
                print(json.dumps({
                    "score": 0,
                    "reason": f"Error: {str(e)}",
                    "skills_matched": [],
                    "missing_skills": [],
                    "ats_score": 0,
                    "matched_keywords": [],
                    "missing_keywords": [],
                    "match_summary": "Error getting inputs"
                }))
                sys.exit(1)

    # Resolve job description from API if not provided in environment
    if not job_description:
        try:
            # Check inside Docker network backend
            res = requests.get("http://web-backend:8000/api/jobs", timeout=2)
            if res.status_code == 200:
                for job in res.json():
                    if job.get("title", "").lower() == job_role.lower():
                        job_description = job.get("description_text", "")
                        break
        except Exception:
            try:
                # Fallback to local host port
                res = requests.get("http://localhost:8000/api/jobs", timeout=2)
                if res.status_code == 200:
                    for job in res.json():
                        if job.get("title", "").lower() == job_role.lower():
                            job_description = job.get("description_text", "")
                            break
            except Exception:
                pass

    if not job_description:
        job_description = f"Requirements and core skills for a {job_role} position."

    # 1. Run ATS Matcher (first, before AI screener)
    ats_result = get_ats_score(resume_text, job_description)

    # 2. Run standard AI Screener
    screener_result = query_ollama_screener(job_role, resume_text, job_description)

    # 3. Combine results
    combined = {
        "score": screener_result.get("score", 0),
        "reason": screener_result.get("reason", "No evaluation details provided."),
        "skills_matched": screener_result.get("skills_matched", []),
        "missing_skills": screener_result.get("missing_skills", []),
        "ats_score": ats_result.get("ats_score", 0),
        "matched_keywords": ats_result.get("matched_keywords", []),
        "missing_keywords": ats_result.get("missing_keywords", []),
        "match_summary": ats_result.get("match_summary", "Evaluation complete.")
    }

    # Normalize fields
    try:
        combined["score"] = int(combined["score"])
    except Exception:
        combined["score"] = 0

    try:
        combined["ats_score"] = int(combined["ats_score"])
    except Exception:
        combined["ats_score"] = 0

    print(json.dumps(combined))

if __name__ == "__main__":
    main()
