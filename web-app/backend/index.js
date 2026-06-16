require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { getDb } = require('./db');
const pdfImgConvert = require('pdf-img-convert');
const Tesseract = require('tesseract.js');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: Run subprocess
const runSubprocess = (command, args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });

    child.on('close', code => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || stdout || `Process exited with code ${code}`));
      }
    });
  });
};

// Helper: OCR Extraction
const extractTextWithOCR = async (pdfBuffer) => {
  try {
    const images = await pdfImgConvert.convert(pdfBuffer, { base64: true, scale: 2.0 });
    let fullText = '';
    for (let i = 0; i < images.length; i++) {
      const base64Data = `data:image/png;base64,${images[i]}`;
      const { data: { text } } = await Tesseract.recognize(base64Data, 'eng');
      fullText += text + '\n';
    }
    return fullText;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  }
};

// Route: List Candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const db = await getDb();
    const candidates = await db('dashboard_candidates').orderBy('timestamp', 'desc');
    const result = candidates.map(c => {
      let skillsMatched = [];
      let missingSkills = [];
      try {
        skillsMatched = c.skills_matched ? JSON.parse(c.skills_matched) : [];
      } catch (e) {
        skillsMatched = [];
      }
      try {
        missingSkills = c.missing_skills ? JSON.parse(c.missing_skills) : [];
      } catch (e) {
        missingSkills = [];
      }
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        job_role: c.job_role,
        job_description_id: c.job_description_id,
        resume_text: c.resume_text,
        score: c.score,
        reason: c.reason,
        skills_matched: skillsMatched,
        missing_skills: missingSkills,
        status: c.status,
        meeting_link: c.meeting_link,
        meet_link: c.meet_link,
        timestamp: c.timestamp ? new Date(c.timestamp).toISOString() : new Date().toISOString()
      };
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ detail: 'Failed to list candidates: ' + err.message });
  }
});

// Route: Delete Candidate
app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    
    const candidate = await db('dashboard_candidates').where({ id }).first();
    if (!candidate) {
      return res.status(404).json({ detail: 'Candidate not found' });
    }
    
    await db('dashboard_candidates').where({ id }).del();
    res.json({ success: true, id: parseInt(id, 10) });
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Route: Upload Candidate Resumes (Bulk)
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    const { job_role, job_description_id, threshold } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ detail: 'No files uploaded' });
    }

    const db = await getDb();

    // Resolve Job Description text if present
    let jobDescriptionText = null;
    let targetJobRole = job_role || 'General Application';

    if (job_description_id) {
      const jobDesc = await db('dashboard_jds').where({ id: parseInt(job_description_id, 10) }).first();
      if (jobDesc) {
        jobDescriptionText = jobDesc.description_text;
        targetJobRole = jobDesc.title;
      }
    }

    const targetThreshold = parseInt(threshold, 10) || 65;

    const results = [];

    // Process each file sequentially
    for (const file of files) {
      // 1. Parse text from file
      let resumeText = '';
      const filename = file.originalname.toLowerCase();

      if (filename.endsWith('.txt')) {
        resumeText = file.buffer.toString('utf-8');
      } else if (filename.endsWith('.pdf')) {
        try {
          const pdfData = await pdfParse(file.buffer);
          resumeText = pdfData.text;
        } catch (err) {
          console.warn('pdf-parse failed, attempting OCR fallback...', err.message);
        }
        
        if (!resumeText || !resumeText.trim()) {
          console.log('No text found with standard parse, attempting OCR...');
          try {
            resumeText = await extractTextWithOCR(file.buffer);
          } catch (ocrErr) {
            results.push({ filename: file.originalname, error: 'Failed to extract text even with OCR: ' + ocrErr.message });
            continue;
          }
        }
      } else {
        results.push({ filename: file.originalname, error: 'Unsupported file format. Please upload a PDF or TXT file.' });
        continue;
      }

      if (!resumeText || !resumeText.trim()) {
        results.push({ filename: file.originalname, error: 'Could not extract text from file.' });
        continue;
      }

      // 2. Query Ollama AI Screener and Extractor
      const jdClause = jobDescriptionText ? `\nJob Description Requirements:\n${jobDescriptionText}\n` : '';
      const prompt = `You are a strict, highly analytical expert HR recruiter. Evaluate this resume for the role of ${targetJobRole}.${jdClause}
CRITICAL INSTRUCTION: If the candidate completely lacks the primary skills required for the target role (e.g., applying for a MERN stack role with only Python/AI experience), you MUST penalize them heavily and assign a total score of LESS THAN 30. Do not be overly generous just because they have a degree or good communication.

Task 1: Extract the candidate's Name, Email, and Phone Number from the resume. If any is not found, use "Not Provided".
Task 2: Score the candidate strictly from 0 to 100 based on:
- Skills match with the target role (50 points) -> DEDUCT AT LEAST 5 TO 10 POINTS FOR **EACH** MISSING SKILL MENTIONED IN THE JOB DESCRIPTION OR MISSING CORE SKILLS.
- Years of strictly relevant experience (20 points) -> Zero points if they have no relevant experience.
- Education (20 points)
- Communication quality of resume (10 points)

Be brutal and realistic. A candidate missing 3-4 preferred skills should NEVER score above 75.

Respond ONLY in JSON format: { "name": "...", "email": "...", "phone": "...", "score": score, "reason": "...", "skills_matched": [...], "missing_skills": [...] }
Resume: ${resumeText}`;

      let name = 'Unknown Candidate';
      let email = 'unknown@example.com';
      let phone = null;
      let score = 0;
      let reason = '';
      let skillsMatched = [];
      let missingSkills = [];

      let retries = 3;
      let delay = 2000;
      while (retries > 0) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
              }
          });

          const responseText = response.text || '';
          let aiResult = {};
          if (responseText) {
            const match = responseText.match(/\{[\s\S]*\}/);
            aiResult = JSON.parse(match ? match[0] : responseText);
          }

          name = aiResult.name || 'Unknown Candidate';
          email = aiResult.email || 'unknown@example.com';
          phone = aiResult.phone || null;

          score = parseInt(aiResult.score, 10);
          if (isNaN(score)) score = 0;

          reason = aiResult.reason || '';

          const rawMatched = aiResult.skills_matched || [];
          if (typeof rawMatched === 'string') {
            skillsMatched = rawMatched.split(',').map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(rawMatched)) {
            skillsMatched = rawMatched;
          }

          const rawMissing = aiResult.missing_skills || [];
          if (typeof rawMissing === 'string') {
            missingSkills = rawMissing.split(',').map(s => s.trim()).filter(Boolean);
          } else if (Array.isArray(rawMissing)) {
            missingSkills = rawMissing;
          }
          break; // Exit loop on success
        } catch (err) {
          retries--;
          if (retries === 0) {
            reason = `AI screener connection error: ${err.message}`;
            console.error("Gemini Upload Error:", err);
          } else {
            console.warn(`Gemini API error (503/429). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }
      }

      const status = score >= targetThreshold ? 'Shortlisted' : 'Rejected';

      // 3. Save Candidate record
      const inserted = await db('dashboard_candidates').insert({
        name: name,
        email: email,
        phone: phone || null,
        job_role: targetJobRole,
        job_description_id: job_description_id ? parseInt(job_description_id, 10) : null,
        resume_text: resumeText,
        score: score,
        reason: reason,
        skills_matched: JSON.stringify(skillsMatched),
        missing_skills: JSON.stringify(missingSkills),
        status: status
      }).returning('id');

      const candidateId = typeof inserted[0] === 'object' ? inserted[0].id : inserted[0];

      results.push({
        id: candidateId,
        name: name,
        email: email,
        score: score,
        status: status,
        reason: reason,
        filename: file.originalname
      });
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('Error processing bulk upload:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Route: Update Candidate Status
app.post('/api/candidates/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({ detail: 'Invalid status option' });
    }

    const db = await getDb();
    const candidate = await db('dashboard_candidates').where({ id }).first();
    if (!candidate) {
      return res.status(404).json({ detail: 'Candidate not found' });
    }

    await db('dashboard_candidates').where({ id }).update({ status });
    res.json({ id: parseInt(id, 10), status });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Route: Update Candidate Meeting Schedule
app.post('/api/candidates/:id/meeting', async (req, res) => {
  try {
    const { id } = req.params;
    const { meeting_link, meet_link } = req.body;

    const db = await getDb();
    const candidate = await db('dashboard_candidates').where({ id }).first();
    if (!candidate) {
      return res.status(404).json({ detail: 'Candidate not found' });
    }

    await db('dashboard_candidates').where({ id }).update({
      meeting_link: meeting_link || null,
      meet_link: meet_link || null
    });

    res.json({ id: parseInt(id, 10), meeting_link, meet_link });
  } catch (err) {
    console.error('Error updating meeting links:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Route: Export Report
app.post('/api/report', async (req, res) => {
  let tempJsonPath = null;
  let outputPdf = null;

  try {
    const db = await getDb();
    const candidates = await db('dashboard_candidates');
    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ detail: 'No candidates found to generate report' });
    }

    // Format candidates list
    const candList = candidates.map(c => {
      let skillsMatched = [];
      try {
        skillsMatched = c.skills_matched ? JSON.parse(c.skills_matched) : [];
      } catch (e) {
        skillsMatched = [];
      }
      return {
        name: c.name,
        email: c.email,
        job_role: c.job_role,
        score: c.score,
        status: c.status,
        reason: c.reason,
        skills_matched: skillsMatched
      };
    });

    // Write to temp JSON file
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const tempJsonFilename = `candidates_report_${uniqueId}.json`;
    tempJsonPath = path.join(os.tmpdir(), tempJsonFilename);
    fs.writeFileSync(tempJsonPath, JSON.stringify(candList));

    // Resolve generate_report.py path dynamically
    let pythonScript = '/data/python/generate_report.py';
    if (!fs.existsSync(pythonScript)) {
      pythonScript = path.resolve(__dirname, '..', '..', 'python', 'generate_report.py');
    }

    const tempPdfFilename = `weekly_report_dashboard_${uniqueId}.pdf`;
    outputPdf = path.join(os.tmpdir(), tempPdfFilename);

    // Inside the container, standard python executable is at /opt/venv/bin/python or python3.
    // If not in virtual environment, fallback to standard python3.
    let pythonExecutable = 'python3';
    if (fs.existsSync('/opt/venv/bin/python3')) {
      pythonExecutable = '/opt/venv/bin/python3';
    } else if (fs.existsSync('/opt/venv/bin/python')) {
      pythonExecutable = '/opt/venv/bin/python';
    }

    await runSubprocess(pythonExecutable, [pythonScript, tempJsonPath, outputPdf]);

    res.download(outputPdf, 'weekly_candidates_report.pdf', (err) => {
      // Cleanup temp files
      try { fs.unlinkSync(tempJsonPath); } catch (_) { }
      try { fs.unlinkSync(outputPdf); } catch (_) { }
    });
  } catch (err) {
    console.error('Error generating report:', err);
    // Cleanup temp files on error
    if (tempJsonPath && fs.existsSync(tempJsonPath)) {
      try { fs.unlinkSync(tempJsonPath); } catch (_) { }
    }
    if (outputPdf && fs.existsSync(outputPdf)) {
      try { fs.unlinkSync(outputPdf); } catch (_) { }
    }
    res.status(500).json({ detail: `PDF generation failed: ${err.message}` });
  }
});

// Route: Create Job Opening
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, description_text } = req.body;
    if (!title || !description_text) {
      return res.status(400).json({ detail: 'Title and description_text are required' });
    }

    const db = await getDb();
    const inserted = await db('dashboard_jds').insert({
      title,
      description_text
    });

    const jobId = inserted[0];
    res.json({ id: jobId, title });
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Route: List Job Openings
app.get('/api/jobs', async (req, res) => {
  try {
    const db = await getDb();
    const jobs = await db('dashboard_jds').orderBy('timestamp', 'desc');
    res.json(jobs.map(j => ({
      id: j.id,
      title: j.title,
      description_text: j.description_text
    })));
  } catch (err) {
    console.error('Error listing jobs:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Route: ATS Check
app.post('/api/ats-check', upload.single('file'), async (req, res) => {
  try {
    const { job_description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ detail: 'No file uploaded' });
    }

    let resumeText = '';
    const filename = file.originalname.toLowerCase();

    if (filename.endsWith('.txt')) {
      resumeText = file.buffer.toString('utf-8');
    } else if (filename.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(file.buffer);
        resumeText = pdfData.text;
      } catch (err) {
        console.warn('pdf-parse failed, attempting OCR fallback...', err.message);
      }

      if (!resumeText || !resumeText.trim()) {
        console.log('No text found with standard parse, attempting OCR...');
        try {
          resumeText = await extractTextWithOCR(file.buffer);
        } catch (ocrErr) {
          return res.status(400).json({ detail: 'Failed to extract text even with OCR: ' + ocrErr.message });
        }
      }
    } else {
      return res.status(400).json({ detail: 'Unsupported file format. Please upload a PDF or TXT file.' });
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ detail: 'Could not extract text from file.' });
    }

    const prompt = `
    You are an ATS (Applicant Tracking System). Compare this resume against the job description.
    
    Return ONLY a JSON with this structure:
    {
      "ats_score": 0-100,
      "matched_keywords": ["python", "docker", ...],
      "missing_keywords": ["kubernetes", "aws", ...],
      "match_summary": "one line explanation"
    }
    
    Job Description: ${job_description}
    Resume: ${resumeText}
    `;

    let atsResult = {
      ats_score: 0,
      matched_keywords: [],
      missing_keywords: [],
      match_summary: 'No match summary generated.'
    };

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
              responseMimeType: "application/json",
          }
      });

      const responseText = response.text || '';
      if (responseText) {
        const match = responseText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : responseText);
        atsResult = {
          ats_score: parseInt(parsed.ats_score, 10) || 0,
          matched_keywords: parsed.matched_keywords || [],
          missing_keywords: parsed.missing_keywords || [],
          match_summary: parsed.match_summary || 'Analysis complete.'
        };
      }
    } catch (err) {
      console.error("Gemini ATS Check Error:", err);
      return res.status(500).json({ detail: 'AI analysis failed: ' + err.message });
    }

    res.json(atsResult);
  } catch (err) {
    console.error('Error in ATS check:', err);
    res.status(500).json({ detail: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
