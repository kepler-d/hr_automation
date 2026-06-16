import sys
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        # Name
        self.set_font('Helvetica', 'B', 24)
        self.cell(0, 10, 'Hardik Derashri', 0, 1, 'C')
        # Contact Info
        self.set_font('Helvetica', '', 12)
        self.set_text_color(100, 100, 100)
        self.cell(0, 10, 'hardik.derashricse2023@indoreinstitute.com | +91 9876543210 | GitHub: github.com/kepler-d', 0, 1, 'C')
        self.ln(5)

    def chapter_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(0, 51, 102)
        self.cell(0, 10, title, 0, 1, 'L')
        self.set_draw_color(0, 51, 102)
        self.line(self.get_x(), self.get_y(), self.get_x() + 190, self.get_y())
        self.ln(2)

    def chapter_body(self, body):
        self.set_font('Helvetica', '', 11)
        self.set_text_color(0, 0, 0)
        self.multi_cell(0, 6, body)
        self.ln(3)

def generate_resume():
    pdf = PDF()
    pdf.add_page()

    # Professional Summary
    pdf.chapter_title('Professional Summary')
    pdf.chapter_body(
        "Highly skilled and motivated Software Engineer specializing in the MERN Stack (MongoDB, Express.js, React.js, Node.js). "
        "Over 2 years of hands-on experience designing, developing, and deploying scalable full-stack web applications. "
        "Strong foundation in Data Structures and Algorithms, with a proven track record of optimizing backend APIs and "
        "building intuitive frontend interfaces. Excellent communicator who thrives in collaborative agile environments."
    )

    # Skills
    pdf.chapter_title('Core Competencies & Technical Skills')
    pdf.chapter_body(
        "- Frontend: React.js, Vite, HTML5, CSS3, Tailwind CSS, Redux Toolkit, JavaScript (ES6+)\n"
        "- Backend: Node.js, Express.js, Python, RESTful API Design, Microservices\n"
        "- Databases: MongoDB (Mongoose), PostgreSQL, SQL, Neon DB\n"
        "- Core CS: Data Structures & Algorithms (DSA), Object-Oriented Programming (OOP), System Design\n"
        "- Tools & Deployment: Git, GitHub, Docker, Docker Compose, Vercel, Render, n8n, Railway"
    )

    # Experience
    pdf.chapter_title('Professional Experience')
    
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 6, 'MERN Stack Developer Intern | Tech Innovations Inc.', 0, 1, 'L')
    pdf.set_font('Helvetica', 'I', 11)
    pdf.cell(0, 6, 'Jan 2024 - Present', 0, 1, 'L')
    pdf.chapter_body(
        "- Architected and developed a full-stack HR Automation platform using React.js and Node.js, increasing recruiter efficiency by 90%.\n"
        "- Engineered a resilient REST API with Express.js that securely handles bulk file uploads and processes them through Google Gemini AI.\n"
        "- Designed and optimized relational schemas in PostgreSQL and unstructured documents in MongoDB, cutting query times by 40%.\n"
        "- Successfully integrated external Webhook automations using n8n and Railway to orchestrate complex background microservices."
    )

    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 6, 'Frontend Engineering Intern | Creative Web Solutions', 0, 1, 'L')
    pdf.set_font('Helvetica', 'I', 11)
    pdf.cell(0, 6, 'May 2023 - Dec 2023', 0, 1, 'L')
    pdf.chapter_body(
        "- Built dynamic, responsive UI components using React.js and Tailwind CSS for a high-traffic e-commerce platform.\n"
        "- Implemented complex client-side state management, significantly improving the overall user experience and page load speed.\n"
        "- Collaborated tightly with backend teams and designers, demonstrating excellent verbal and written communication skills."
    )

    # Education
    pdf.chapter_title('Education')
    pdf.set_font('Helvetica', 'B', 12)
    pdf.cell(0, 6, 'Bachelor of Technology in Computer Science and Engineering', 0, 1, 'L')
    pdf.set_font('Helvetica', 'I', 11)
    pdf.cell(0, 6, 'Indore Institute of Science and Technology | Expected Graduation: 2026', 0, 1, 'L')
    pdf.chapter_body(
        "- Relevant Coursework: Data Structures and Algorithms, Database Management Systems, Operating Systems, Web Technologies."
    )

    # Save
    output_path = r"C:\Users\HARDIK\Downloads\Hardik_Derashri_Perfect_Resume.pdf"
    pdf.output(output_path)
    print(f"Resume generated at {output_path}")

if __name__ == '__main__':
    generate_resume()
