import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
dotenv.config();
import connectDB from '../config/db.js';
import { generateAndValidateCodingChallenge } from '../services/codingChallengeService.js';

async function testGeneration() {
  await connectDB();

  console.log('==================================================');
  console.log('TEST 1: AI Programming Challenge Generation (Loops / Easy)');
  console.log('==================================================');

  const pChallenge = await generateAndValidateCodingChallenge({
    track: 'programming',
    topic: 'Loops & Iterations',
    difficulty: 'Easy'
  });

  console.log('Generated Programming Challenge:');
  console.log('Title:', pChallenge.title);
  console.log('Constraints:', pChallenge.constraints);
  console.log('Visible Test Cases Count:', pChallenge.visibleTestCases.length);
  console.log('Hidden Test Cases Count:', pChallenge.hiddenTestCases.length);
  console.log('Sample Example:', pChallenge.examples?.[0]);
  console.log('Reference Solution Language:', pChallenge.referenceSolution?.language);

  console.log('\n==================================================');
  console.log('TEST 2: AI DSA Challenge Generation (Arrays & Subarrays / Medium)');
  console.log('==================================================');

  const dsaChallenge = await generateAndValidateCodingChallenge({
    track: 'dsa',
    topic: 'Arrays & Subarrays',
    difficulty: 'Medium'
  });

  console.log('Generated DSA Challenge:');
  console.log('Title:', dsaChallenge.title);
  console.log('Constraints:', dsaChallenge.constraints);
  console.log('Visible Test Cases Count:', dsaChallenge.visibleTestCases.length);
  console.log('Hidden Test Cases Count:', dsaChallenge.hiddenTestCases.length);
  console.log('Hints:', dsaChallenge.hints);

  console.log('\n✅ All backend generation & validation tests completed successfully!');
  process.exit(0);
}

testGeneration().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
