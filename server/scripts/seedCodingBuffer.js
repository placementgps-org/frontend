import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
dotenv.config();
import connectDB from '../config/db.js';
import CodingChallenge from '../models/CodingChallenge.js';
import { generateAndValidateCodingChallenge } from '../services/codingChallengeService.js';

const TARGET_BUFFER_TOPICS = [
  { track: 'programming', topic: 'Variables & Data Types', difficulty: 'Easy' },
  { track: 'programming', topic: 'Operators & Expressions', difficulty: 'Easy' },
  { track: 'programming', topic: 'Conditionals (If-Else & Switch)', difficulty: 'Easy' },
  { track: 'programming', topic: 'Loops & Iterations', difficulty: 'Easy' },
  { track: 'programming', topic: 'Arrays & Lists', difficulty: 'Easy' },
  { track: 'programming', topic: 'Strings & Character Manipulation', difficulty: 'Easy' },
  { track: 'dsa', topic: 'Arrays & Subarrays', difficulty: 'Easy' },
  { track: 'dsa', topic: 'Arrays & Subarrays', difficulty: 'Medium' },
  { track: 'dsa', topic: 'Strings & Two Pointers', difficulty: 'Easy' },
  { track: 'dsa', topic: 'Recursion & Backtracking', difficulty: 'Medium' }
];

async function seedBuffer() {
  await connectDB();
  console.log('🚀 Starting Coding Practice Buffer Pre-warming...');

  for (const item of TARGET_BUFFER_TOPICS) {
    const existingCount = await CodingChallenge.countDocuments({
      track: item.track,
      topic: item.topic,
      difficulty: item.difficulty
    });

    console.log(`[BufferCheck] ${item.track} -> ${item.topic} (${item.difficulty}): ${existingCount} ready in DB.`);

    if (existingCount < 2) {
      const needed = 2 - existingCount;
      for (let i = 0; i < needed; i++) {
        console.log(`[BufferGen] Pre-generating challenge ${i + 1}/${needed} for ${item.topic} (${item.difficulty})...`);
        try {
          const generated = await generateAndValidateCodingChallenge({
            track: item.track,
            topic: item.topic,
            difficulty: item.difficulty
          });
          console.log(`✅ Pre-warmed: "${generated.title}"`);
        } catch (err) {
          console.warn(`⚠️ Pre-warm error for ${item.topic}:`, err.message);
        }
      }
    }
  }

  console.log('🎉 Coding buffer pre-warming completed! All core topics have instant cached challenges ready.');
  process.exit(0);
}

seedBuffer().catch((err) => {
  console.error('Seed buffer failed:', err);
  process.exit(1);
});
