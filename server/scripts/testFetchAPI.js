import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import mongoose from 'mongoose';
import AptitudeQuestion from '../models/AptitudeQuestion.js';
// We just import the controller and mock req/res
import { getQuestions } from '../controllers/aptitudeController.js';

const run = async () => {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGO_URI);
  
  // Cleanup any bad questions that might cause the index error
  await AptitudeQuestion.deleteMany({ normalizedQuestion: null });

  console.log('Testing getQuestions (fetchOrGenerateQuestions)...');
  const req = {
    query: { category: 'numerical', topic: 'Percentages', difficulty: 'Easy', limit: 10 }
  };
  const res = {
    json: (data) => console.log('RESPONSE:', JSON.stringify(data, null, 2).substring(0, 500) + '\n...'),
    status: (code) => ({ json: (data) => console.error('ERROR:', code, data) })
  };

  console.time('fetchOrGenerateTime');
  await getQuestions(req, res);
  console.timeEnd('fetchOrGenerateTime');
  
  process.exit(0);
};

run();
