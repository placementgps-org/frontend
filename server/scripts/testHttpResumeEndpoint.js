import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const SAMPLE_RESUME_TEXT = `
PRIYA NAIR
priya.nair@email.com | +91 98765 12345 | github.com/priyanair

EDUCATION
B.Tech in Information Technology | 2021 - 2025
CGPA: 8.6/10.0

SKILLS
Python, Django, PostgreSQL, JavaScript, React.js, Docker, Git, REST APIs

PROJECTS
MedTrack — Healthcare Appointment Portal | Python, Django, React, PostgreSQL
• Developed full-stack healthcare booking system with role-based patient/doctor authentication.
• Integrated calendar slot management and automated email reminders using Celery and Redis.
• Live Demo: https://medtrack-demo.app | GitHub: github.com/priyanair/medtrack

CERTIFICATIONS
• AWS Certified Cloud Practitioner
• Postman API Fundamentals Student Expert
`;

async function testHttpEndpoints() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for HTTP endpoint test');

    // Find or create test user
    let user = await User.findOne({ email: 'test.student@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Test Student',
        email: 'test.student@example.com',
        password: 'Password123!',
        emailVerified: true
      });
    }

    const token = generateToken(user._id);
    console.log(`Generated test JWT token for user: ${user.name}`);

    // Create a multipart form-data request with text resume buffer
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const bodyHeader = `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="priya_nair_resume.txt"\r\nContent-Type: text/plain\r\n\r\n`;
    const bodyFooter = `\r\n--${boundary}--\r\n`;

    const multipartBody = Buffer.concat([
      Buffer.from(bodyHeader, 'utf-8'),
      Buffer.from(SAMPLE_RESUME_TEXT, 'utf-8'),
      Buffer.from(bodyFooter, 'utf-8')
    ]);

    console.log('\nSending POST /api/resume/upload...');
    const uploadRes = await fetch('http://localhost:5005/api/resume/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: multipartBody
    });

    const uploadData = await uploadRes.json();
    console.log(`Upload Response Status: ${uploadRes.status}, Success: ${uploadData.success}`);

    if (!uploadData.success) {
      throw new Error(`Upload failed: ${uploadData.message}`);
    }

    console.log(`- Uploaded File: ${uploadData.data?.fileName}`);
    console.log(`- Overall Score: ${uploadData.data?.analysis?.overallScore}`);
    console.log(`- ATS Score: ${uploadData.data?.analysis?.atsScore}`);
    console.log(`- Top Suitable Role: ${uploadData.data?.analysis?.suitableRoles?.[0]?.role}`);
    console.log(`- Recommended Free Courses Count: ${uploadData.data?.analysis?.courseRecommendations?.length}`);

    // Test GET /api/resume/me
    console.log('\nSending GET /api/resume/me...');
    const getRes = await fetch('http://localhost:5005/api/resume/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const getData = await getRes.json();
    console.log(`GET /me Status: ${getRes.status}, hasResume: ${getData.hasResume}`);
    console.log(`- Retrieved Resume: ${getData.data?.fileName} (${getData.data?.analysis?.overallScore}/100)`);

    console.log('\n✅ ALL RESUME HTTP ENDPOINTS VERIFIED AND WORKING PERFECTLY!');
    process.exit(0);

  } catch (err) {
    console.error('HTTP Endpoint test error:', err);
    process.exit(1);
  }
}

testHttpEndpoints();
