import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';
import CodingChallenge from '../models/CodingChallenge.js';

async function testPerformance() {
  await connectDB();

  console.log('==================================================');
  console.log('TEST 1: Fast Cached Challenge Retrieval Speed');
  console.log('==================================================');

  const start1 = Date.now();
  const cachedChallenge = await CodingChallenge.findOne({
    track: 'programming',
    topic: 'Variables & Data Types',
    difficulty: 'Easy'
  }).lean();
  const elapsed1 = Date.now() - start1;

  console.log(`⚡ Retrieved cached challenge in: ${elapsed1}ms`);
  console.log(`Title: "${cachedChallenge?.title}"`);
  console.log(`Visible Test Cases: ${cachedChallenge?.visibleTestCases?.length}`);

  console.log('\n==================================================');
  console.log('TEST 2: Buffer Pool Count across Topics');
  console.log('==================================================');

  const counts = await CodingChallenge.aggregate([
    {
      $group: {
        _id: { track: '$track', topic: '$topic', difficulty: '$difficulty' },
        count: { $sum: 1 }
      }
    }
  ]);

  console.log('Topics currently in MongoDB cache buffer:');
  counts.forEach((c) => {
    console.log(`- ${c._id.track} -> ${c._id.topic} (${c._id.difficulty}): ${c.count} challenges ready`);
  });

  console.log('\n✅ Performance tests completed!');
  process.exit(0);
}

testPerformance().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
