import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';
import { getRoadmapTemplate } from '../data/roadmapTemplates.js';
import { generateRoleKeywords, scoreCourseRelevance } from '../services/aiService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const ROLES_TO_TEST = [
  'software-engineer',
  'full-stack-developer',
  'ai-engineer',
  'data-scientist',
  'cybersecurity-engineer',
  'network-engineer',
  'business-analyst',
  'financial-analyst',
  'hr-specialist',
  'digital-marketing-specialist',
  'graphic-designer',
  'accountant'
];

async function testRecommendations() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  for (const careerId of ROLES_TO_TEST) {
    console.log(`\n===============================================`);
    console.log(`TESTING ROLE: ${careerId.toUpperCase()}`);
    console.log(`===============================================`);
    
    let template = getRoadmapTemplate(careerId);
    if (!template) {
       console.log('Template not found for:', careerId);
       continue;
    }
    
    let activeStage = template.stages[0];
    const stageSkillKeywords = activeStage.topics.map(t => t.title);

    console.log(`1. Generating keywords for ${template.title}...`);
    const roleKeywords = await generateRoleKeywords(template.title);
    console.log(`Keywords: ${roleKeywords.join(', ')}`);

    const keywordRegexes = roleKeywords.map(k => new RegExp(k, 'i'));

    console.log(`2. Searching candidate courses...`);
    const candidateCourses = await Course.find({
      $or: [
        { roles: careerId },
        { roadmapStages: activeStage.id },
        { skillsArray: { $in: stageSkillKeywords } },
        { courseName: { $in: keywordRegexes } },
        { skillsArray: { $in: keywordRegexes } },
        { category: { $in: keywordRegexes } }
      ],
      active: true
    }).lean();

    const isCybersecurityRole = careerId === 'cybersecurity-engineer';
    const filteredCandidates = candidateCourses.filter(c => {
      const isRoleSpecific = c.roles && c.roles.length > 0;
      const hasRoleMatch = c.roles?.includes(careerId);
      
      if (isRoleSpecific && !hasRoleMatch) return false;

      const courseNameLower = c.courseName ? c.courseName.toLowerCase() : '';
      const skillsStr = c.skillsArray ? c.skillsArray.join(' ').toLowerCase() : '';
      
      const isCyberCourse = 
        courseNameLower.includes('cybersecurity') || 
        courseNameLower.includes('threat') || 
        courseNameLower.includes('hacker') || 
        courseNameLower.includes('penetration') ||
        courseNameLower.includes('security operations') ||
        skillsStr.includes('offensive security') ||
        skillsStr.includes('defensive security');
      
      if (!isCybersecurityRole && isCyberCourse) return false;
      return true;
    });

    console.log(`Found ${filteredCandidates.length} candidate courses after pre-filtering.`);
    
    if (filteredCandidates.length === 0) {
      console.log('No candidates found.');
      continue;
    }

    const topCandidatesForScoring = filteredCandidates.slice(0, 30);
    console.log(`3. AI Scoring top ${topCandidatesForScoring.length} courses...`);
    
    const aiScores = await scoreCourseRelevance(topCandidatesForScoring, template.title, roleKeywords);
    
    const enrichedCourses = topCandidatesForScoring.map(course => {
      const aiEval = aiScores.find(s => s.courseId === course.courseId);
      const score = aiEval ? aiEval.relevanceScore : 0;
      const aiExplanation = aiEval ? aiEval.explanation : 'Recommended';
      return { ...course, relevanceScore: score, aiExplanation };
    });

    const finalRanked = enrichedCourses
      .filter(c => c.relevanceScore >= 60)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);

    console.log(`4. Top ${finalRanked.length} Recommendations:`);
    for (let i = 0; i < finalRanked.length; i++) {
       const c = finalRanked[i];
       console.log(`[${i+1}] ${c.courseName} (Score: ${c.relevanceScore}%)`);
       console.log(`    AI Explanation: ${c.aiExplanation}`);
    }
  }

  mongoose.disconnect();
}

testRecommendations().catch(console.error);
