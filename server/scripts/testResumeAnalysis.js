import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeResumeWithAI, matchFreeCoursesForResume } from '../services/resumeAnalysisService.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const SAMPLE_RESUME_TEXT = `
ALEX CHEN
San Francisco, CA | alex.chen@email.com | (555) 123-4567 | github.com/alexchen | linkedin.com/in/alexchen

EDUCATION
Bachelor of Science in Computer Science | Expected May 2026
University of California, Berkeley
GPA: 3.8/4.0 | Relevant Coursework: Data Structures, Algorithms, Database Systems, Web Architecture

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3
Frameworks & Libraries: React.js, Node.js, Express.js, Flask, Tailwind CSS
Databases & Tools: MongoDB, PostgreSQL, Git, GitHub, Postman, Docker
Core Concepts: RESTful APIs, OOP, Responsive Design, State Management

PROJECTS
DevConnect — Developer Community Platform | React, Node.js, MongoDB, Express
• Architected a full-stack platform enabling developers to share code snippets, collaborate, and ask questions.
• Developed secure JWT authentication and role-based access control for 500+ simulated users.
• Implemented RESTful APIs with MongoDB Mongoose for CRUD operations, reducing average query latency by 35%.
• Live Demo: https://devconnect-demo.vercel.app | GitHub: github.com/alexchen/devconnect

SmartTask — AI-Powered Task Prioritization CLI | Python, SQLite
• Built an automated task organizer utilizing priority queues and natural language pattern matching.
• Stored 1,000+ local task items in SQLite with sub-millisecond retrieval benchmarks.
• GitHub: github.com/alexchen/smarttask-cli

EXPERIENCE / LEADERSHIP
Technical Lead | ACM Student Chapter | Sep 2024 – Present
• Mentored 40+ sophomore students in web development fundamentals (HTML/CSS/JS/React).
• Organized bi-weekly technical interview workshops covering LeetCode data structures and algorithms.

CERTIFICATIONS
• Meta Front-End Developer Specialization (Coursera)
• Python for Everybody (University of Michigan)
`;

async function testResumePipeline() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for Resume Pipeline test\n');

    console.log('Testing AI Resume Analysis with Gemini 3.5 Flash Lite...');
    const startTime = Date.now();
    const analysis = await analyzeResumeWithAI(SAMPLE_RESUME_TEXT, {
      name: 'Alex Chen',
      targetCareer: 'Full Stack Developer'
    });
    const duration = Date.now() - startTime;

    console.log(`\nAnalysis completed in ${duration}ms:`);
    console.log(`- Overall Score: ${analysis.overallScore}/100`);
    console.log(`- ATS Score: ${analysis.atsScore}/100`);
    console.log(`- Skills Score: ${analysis.skillsScore}/100`);
    console.log(`- Projects Score: ${analysis.projectsScore}/100`);
    console.log(`- Overall Impression: "${analysis.overallImpression}"`);

    console.log(`\nDetected Skills (${analysis.skillsAnalysis.detected.length}):`, analysis.skillsAnalysis.detected.join(', '));
    console.log(`Strong Skills:`, analysis.skillsAnalysis.strong.join(', '));
    console.log(`Missing Skills for Target Roles:`, analysis.skillsAnalysis.missingForTargetRoles.join(', '));

    console.log(`\nSuitable Roles (${analysis.suitableRoles.length}):`);
    analysis.suitableRoles.forEach(r => {
      console.log(`  • ${r.role} (${r.matchPercentage}% Match) — ${r.reason}`);
    });

    console.log(`\nInternship Readiness: Level = ${analysis.internshipReadiness.readinessLevel}`);
    console.log(`Suitable Domains:`, analysis.internshipReadiness.suitableDomains.join(', '));

    console.log('\nMatching Free Courses from MongoDB 141-Course Catalog...');
    const matchedCourses = await matchFreeCoursesForResume(analysis, 'Full Stack Developer');
    console.log(`Retrieved ${matchedCourses.length} curated course recommendations:`);
    matchedCourses.forEach((c, idx) => {
      console.log(`  [${idx + 1}] [${c.priority.toUpperCase()}] ${c.courseName} (${c.provider})`);
      console.log(`      Link: ${c.courseLink}`);
      console.log(`      Why: ${c.reason}`);
    });

    // Verification asserts
    const validScores = [analysis.overallScore, analysis.atsScore, analysis.skillsScore, analysis.projectsScore].every(s => s >= 50 && s <= 100);
    const validRoles = analysis.suitableRoles && analysis.suitableRoles.length > 0;
    const validCourses = matchedCourses.length > 0 && matchedCourses.every(c => c.courseLink && c.courseLink.startsWith('http'));

    if (validScores && validRoles && validCourses) {
      console.log('\n🎉 ALL RESUME ANALYSER PIPELINE TESTS PASSED!');
    } else {
      console.error('\n❌ VALIDATION CHECKS FAILED!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Test pipeline error:', err);
    process.exit(1);
  }
}

testResumePipeline();
