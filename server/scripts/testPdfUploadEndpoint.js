import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const samplePdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 380 >> stream
BT
/F1 12 Tf
72 712 Td
(HARSHITHA REDDY) Tj
0 -20 Td
(harshitha@email.com | +91 98765 43210 | Bengaluru) Tj
0 -30 Td
(EDUCATION: B.Tech in Computer Science and Engineering, CGPA 8.5) Tj
0 -30 Td
(SKILLS: Python, Java, JavaScript, React.js, Node.js, Express, MongoDB, SQL, Git) Tj
0 -30 Td
(PROJECT: Placement GPS - Career & Resume Recommendation Portal with React and Node.js) Tj
ET
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000696 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
776
%%EOF`;

async function testPdfUpload() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for PDF upload test');

    const user = await User.findOne({ email: 'test.student@example.com' });
    if (!user) throw new Error('Test student user not found');

    const token = generateToken(user._id);

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const bodyHeader = `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="harshitha_resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;
    const bodyFooter = `\r\n--${boundary}--\r\n`;

    const multipartBody = Buffer.concat([
      Buffer.from(bodyHeader, 'utf-8'),
      Buffer.from(samplePdf, 'utf-8'),
      Buffer.from(bodyFooter, 'utf-8')
    ]);

    console.log('Uploading PDF resume to http://localhost:5005/api/resume/upload...');
    const response = await fetch('http://localhost:5005/api/resume/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: multipartBody
    });

    const data = await response.json();
    console.log(`Upload Status: ${response.status}, Success: ${data.success}`);

    if (!data.success) {
      throw new Error(`Upload failed: ${data.message}`);
    }

    console.log('✅ PDF upload and analysis successfully processed!');
    console.log(`- File Name: ${data.data?.fileName}`);
    console.log(`- Overall Score: ${data.data?.analysis?.overallScore}`);
    console.log(`- ATS Score: ${data.data?.analysis?.atsScore}`);
    console.log(`- Skills Detected: ${data.data?.analysis?.skillsAnalysis?.detected?.join(', ')}`);
    console.log(`- Suitable Roles: ${data.data?.analysis?.suitableRoles?.map(r => r.role).join(', ')}`);
    console.log(`- Free Courses Curated: ${data.data?.analysis?.courseRecommendations?.length}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ PDF Upload test error:', err);
    process.exit(1);
  }
}

testPdfUpload();
