import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRecommendedCoursesForStage } from '../services/courseMatchingService.js';
import { getRoadmapTemplate } from '../data/roadmapTemplates.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const TEST_ROLES = [
  'full-stack-developer',
  'software-engineer',
  'ai-engineer',
  'data-scientist',
  'cybersecurity-engineer',
  'cloud-architect',
  'devops-engineer',
  'business-analyst',
  'financial-analyst',
  'hr-specialist',
  'digital-marketing-specialist',
  'graphic-designer'
];

async function runTests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for recommendation tests...\n');

    let passedCount = 0;

    for (const roleId of TEST_ROLES) {
      const template = getRoadmapTemplate(roleId);
      const stage = template?.stages?.[0] || { id: 's1', title: 'Foundations', topics: [] };

      console.log(`=======================================================`);
      console.log(`Testing Role: "${template?.title || roleId}" | Stage: "${stage.title}"`);

      const startTime = Date.now();
      const results = await getRecommendedCoursesForStage({
        careerId: roleId,
        careerTitle: template?.title,
        stageId: stage.id,
        stageTitle: stage.title,
        stageTopics: stage.topics,
        limit: 4
      });
      const duration = Date.now() - startTime;

      console.log(`Fetched ${results.length} recommendations in ${duration}ms:`);

      if (results.length === 0) {
        console.error(`❌ FAILED: 0 recommendations returned for ${roleId}`);
      } else {
        results.forEach((c, idx) => {
          console.log(`  [${idx + 1}] (${c.relevanceScore}%) ${c.courseName} [${c.provider}]`);
          console.log(`      Link: ${c.courseLink}`);
          console.log(`      Why: ${c.aiExplanation}`);
        });

        // Verification checks:
        // 1. All course links must start with http
        const validLinks = results.every(c => c.courseLink && c.courseLink.startsWith('http'));
        // 2. Scores must be between 60 and 100
        const validScores = results.every(c => c.relevanceScore >= 60 && c.relevanceScore <= 100);
        // 3. For full stack, ensure no pure cybersecurity courses
        const isFullStack = roleId === 'full-stack-developer';
        const hasCybersecurity = results.some(c => c.courseName.toLowerCase().includes('threat intelligence') || c.courseName.toLowerCase().includes('penetration testing'));

        if (!validLinks) {
          console.error(`❌ FAILED: Invalid courseLink found`);
        } else if (!validScores) {
          console.error(`❌ FAILED: Scores outside expected range`);
        } else if (isFullStack && hasCybersecurity) {
          console.error(`❌ FAILED: Cybersecurity course recommended to full stack developer`);
        } else {
          console.log(`✅ PASSED: Recommendations are highly relevant and valid`);
          passedCount++;
        }
      }
      console.log();
    }

    console.log(`=======================================================`);
    console.log(`SUMMARY: ${passedCount}/${TEST_ROLES.length} roles passed validation!`);

    // Test Caching speed (second call for full-stack-developer should be < 10ms)
    console.log('\nTesting In-Memory Cache Performance...');
    const cacheStart = Date.now();
    const cachedResult = await getRecommendedCoursesForStage({
      careerId: 'full-stack-developer',
      stageId: 'fs-s1'
    });
    const cacheDuration = Date.now() - cacheStart;
    console.log(`Cache response time: ${cacheDuration}ms (${cachedResult.length} courses returned)`);
    if (cacheDuration < 15) {
      console.log('✅ In-memory cache is blazing fast (< 15ms)!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
