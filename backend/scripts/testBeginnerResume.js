import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeResumeWithAI, matchFreeCoursesForResume } from '../services/resumeAnalysisService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const BEGINNER_RESUME = `
RAHUL SHARMA
Bengaluru, India | rahul.sharma@email.com | +91 98765 43210

OBJECTIVE
Motivated 3rd-year Computer Science Engineering student seeking an internship opportunity in software development.

EDUCATION
B.Tech in Computer Science and Engineering (2022 - 2026)
Visvesvaraya Technological University, Belagavi
CGPA: 7.4/10.0

SKILLS
C, C++, Java, Python, HTML, CSS, Problem Solving, Teamwork, Communication

WORKSHOPS & ACTIVITIES
• Attended 2-day Workshop on Artificial Intelligence
• Member of College Cultural Club
`;

async function testBeginner() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Testing beginner resume with 0 projects...');
    const analysis = await analyzeResumeWithAI(BEGINNER_RESUME, {
      name: 'Rahul Sharma',
      targetCareer: 'Software Engineer'
    });

    console.log(`- Overall Score: ${analysis.overallScore}/100`);
    console.log(`- Projects Score: ${analysis.projectsScore}/100 (hasProjects: ${analysis.projectsAnalysis.hasProjects})`);
    console.log(`- Projects Explanation: "${analysis.projectsAnalysis.explanation}"`);
    console.log(`- Internship Readiness: Level = ${analysis.internshipReadiness.readinessLevel}`);
    console.log(`- Actionable Projects Improvements:`, analysis.thingsToImprove.projects);

    const matchedCourses = await matchFreeCoursesForResume(analysis, 'Software Engineer');
    console.log(`- Curated Free Courses (${matchedCourses.length}):`);
    matchedCourses.slice(0, 3).forEach(c => {
      console.log(`  * [${c.priority.toUpperCase()}] ${c.courseName} -> ${c.reason}`);
    });

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testBeginner();
