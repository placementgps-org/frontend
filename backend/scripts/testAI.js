import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import { generateQuestionsFromAI } from '../services/aiService.js';
import mongoose from 'mongoose';

const run = async () => {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Generating 10 questions...');
  
  console.time('Gemini Gen');
  try {
    const qs = await generateQuestionsFromAI('numerical', 'Percentages', 'Easy', 10);
    console.log(`Generated and inserted: ${qs.length} questions`);
    // Output the first one just to see
    if (qs.length > 0) {
      console.log('First question:', qs[0].question);
    }
  } catch (e) {
    console.error('Failed:', e);
  }
  console.timeEnd('Gemini Gen');
  process.exit(0);
};

run();
