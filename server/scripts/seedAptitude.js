import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AptitudeQuestion from '../models/AptitudeQuestion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const sampleQuestions = [
  {
    category: 'numerical',
    topic: 'percentages',
    subtopic: 'basics',
    question: 'If the price of a shirt is increased by 20% and then decreased by 10%, what is the net percentage change in the price?',
    options: ['8% increase', '10% increase', '10% decrease', '8% decrease'],
    correctAnswer: '8% increase',
    explanation: 'Using the successive percentage formula: A + B + (A*B)/100. Here A = 20, B = -10. So, 20 - 10 + (20 * -10)/100 = 10 - 2 = 8. Since it is positive, it is an 8% increase.',
    solution: [
      'Let the initial price be ₹100.',
      'After 20% increase, new price = 100 + 20 = 120.',
      'After 10% decrease on 120, decrease = 10% of 120 = 12.',
      'Final price = 120 - 12 = 108.',
      'Net change = (108 - 100) / 100 × 100 = 8% increase.'
    ],
    shortcut: 'Net % = 20 + (-10) + (20 × -10) / 100 = 10 - 2 = 8%',
    difficulty: 'Easy',
    company: ['TCS', 'Infosys'],
    tags: ['successive', 'price'],
  },
  {
    category: 'numerical',
    topic: 'percentages',
    subtopic: 'population',
    question: 'The population of a town increases by 5% annually. If its present population is 8000, what will it be in 2 years?',
    options: ['8800', '8820', '8840', '8900'],
    correctAnswer: '8820',
    explanation: 'This is similar to compound interest. Population after 2 years = P(1 + R/100)^2 = 8000 * (1 + 5/100)^2 = 8000 * (21/20) * (21/20) = 20 * 441 = 8820.',
    solution: [
      'Present population (P) = 8000',
      'Rate of increase (R) = 5%',
      'Time (T) = 2 years',
      'Population after 2 years = 8000 * (1.05)^2',
      '= 8000 * 1.1025 = 8820'
    ],
    difficulty: 'Medium',
    company: ['Accenture'],
    tags: ['population'],
  },
  {
    category: 'numerical',
    topic: 'percentages',
    subtopic: 'voting',
    question: 'In an election between two candidates, one got 55% of the total valid votes, 20% of the votes were invalid. If the total number of votes was 7500, the number of valid votes that the other candidate got, was:',
    options: ['2700', '2900', '3000', '3100'],
    correctAnswer: '2700',
    explanation: 'Total number of votes = 7500. Number of valid votes = 80% of 7500 = 6000. Valid votes polled by other candidate = 45% of 6000 = (45/100) * 6000 = 2700.',
    solution: [
      'Total votes = 7500',
      'Invalid votes = 20% of 7500 = 1500',
      'Valid votes = 7500 - 1500 = 6000',
      'First candidate got 55% of valid votes.',
      'Second candidate got (100 - 55)% = 45% of valid votes.',
      'Number of votes for second candidate = 45% of 6000 = 2700.'
    ],
    difficulty: 'Hard',
    company: ['Deloitte', 'Cognizant'],
    tags: ['election'],
  }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI is undefined. Check your .env file.');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    await AptitudeQuestion.deleteMany({});
    console.log('Cleared existing questions.');

    await AptitudeQuestion.insertMany(sampleQuestions);
    console.log('Seeded sample questions successfully.');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
