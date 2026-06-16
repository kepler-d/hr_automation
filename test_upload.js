const fs = require('fs');

async function testUpload() {
  const formData = new FormData();
  
  // Create two dummy text files
  const file1 = new Blob(["Resume 1 text"], { type: 'text/plain' });
  const file2 = new Blob(["Resume 2 text"], { type: 'text/plain' });
  
  formData.append('files', file1, 'resume1.txt');
  formData.append('files', file2, 'resume2.txt');
  formData.append('job_role', 'Software Engineer');
  formData.append('threshold', '65');
  
  try {
    const res = await fetch('http://localhost:8000/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

testUpload();
