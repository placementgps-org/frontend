import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { processCareerAssistantQuery } from '../services/resumeAssistantService.js';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Course from '../models/Course.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const SAMPLE_RESUME_DOC = {
  extractedText: `
    PRIYA NAIR
    B.Tech Information Technology, CGPA 8.6
    Skills: Python, Django, PostgreSQL, JavaScript, React.js, Docker, Git, REST APIs
    Project: MedTrack Healthcare Appointment Booking System with Django and React
  `,
  analysis: {
    overallScore: 82,
    atsScore: 88,
    skillsScore: 85,
    projectsScore: 80,
    skillsAnalysis: {
      detected: ['Python', 'Django', 'PostgreSQL', 'JavaScript', 'React.js', 'Docker', 'Git', 'REST APIs'],
      strong: ['Python', 'Django', 'React.js'],
      weakOrInsufficient: ['Docker'],
      missingForTargetRoles: ['GraphQL', 'Kubernetes', 'Redis', 'CI/CD Pipelines']
    },
    suitableRoles: [
      { role: 'Python Developer', matchPercentage: 90, reason: 'Strong Python & Django experience', missingSkills: ['Redis', 'Celery'] },
      { role: 'Full Stack Developer', matchPercentage: 85, reason: 'React and backend experience', missingSkills: ['GraphQL'] }
    ],
    internshipReadiness: {
      readinessLevel: 'High',
      suitableDomains: ['Backend Development', 'Full Stack Web Development']
    }
  }
};

async function testCareerAssistant() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for AI Career Assistant test\n');

    const userContext = { name: 'Priya Nair', targetCareer: 'Python Developer' };

    // Test 1: General Question: What skill should I learn next?
    console.log('=== TEST 1: General Career Question ("What skill should I learn next?") ===');
    const res1 = await processCareerAssistantQuery({
      resume: SAMPLE_RESUME_DOC,
      userContext,
      message: 'What skill should I learn next to improve my placement chances?'
    });
    console.log('AI Response:\n', res1.message);
    console.log('\n----------------------------------------\n');

    // Test 2: Role Readiness: Am I ready for Python Developer role?
    console.log('=== TEST 2: Role Readiness ("Am I ready for a Python Developer role?") ===');
    const res2 = await processCareerAssistantQuery({
      resume: SAMPLE_RESUME_DOC,
      userContext,
      message: 'Am I ready to apply for Python Developer roles right now?'
    });
    console.log('AI Response:\n', res2.message);
    console.log('\n----------------------------------------\n');

    // Test 3: Course Evaluation (Basic Python course when she already knows Python)
    console.log('=== TEST 3: Course Evaluation for Basic Python Course (Expected: Too Basic or Moderate) ===');
    const res3 = await processCareerAssistantQuery({
      resume: SAMPLE_RESUME_DOC,
      userContext,
      message: 'Is "CS50: Introduction to Programming with Python" good for me?',
      courseName: 'CS50: Introduction to Programming with Python'
    });
    console.log('Is Course Evaluation:', res3.isCourseEvaluation);
    if (res3.courseEvaluation) {
      console.log('Course:', res3.courseEvaluation.courseName);
      console.log('Relevance %:', res3.courseEvaluation.relevancePercentage);
      console.log('Course Level:', res3.courseEvaluation.courseLevel, '| Student Level:', res3.courseEvaluation.studentLevel);
      console.log('Suitability:', res3.courseEvaluation.suitability);
      console.log('Reason:', res3.courseEvaluation.reason);
      console.log('Better Alternative:', res3.courseEvaluation.betterAlternative);
    }
    console.log('\n----------------------------------------\n');

    // Test 4: Course Evaluation for Irrelevant Course
    console.log('=== TEST 4: Course Evaluation for Non-Tech Course (Expected: Not Relevant) ===');
    const res4 = await processCareerAssistantQuery({
      resume: SAMPLE_RESUME_DOC,
      userContext,
      message: 'Should I take a course on Basic Accounting and Financial Statements?'
    });
    console.log('AI Response:\n', res4.message);
    console.log('\n----------------------------------------\n');

    console.log('🎉 ALL AI CAREER ASSISTANT TESTS EXECUTED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

testCareerAssistant();
