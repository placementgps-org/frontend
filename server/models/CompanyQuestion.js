import mongoose from 'mongoose';

const companyQuestionSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      index: true,
    },
    subtopic: {
      type: String,
    },
    question: {
      type: String,
      required: true,
    },
    normalizedQuestion: {
      type: String,
    },
    options: {
      type: [String],
      required: true,
      validate: [v => v.length >= 2, 'A question must have at least 2 options'],
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    solution: {
      type: [String],
      default: [],
    },
    shortcut: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    year: {
      type: Number,
    },
    role: {
      type: String,
    },
    source: {
      type: String,
    },
    sourceUrl: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    questionType: {
      type: String,
      enum: ['Verified Actual', 'Company-Style AI'],
      default: 'Company-Style AI',
    },
    generatedByAI: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

const CompanyQuestion = mongoose.model('CompanyQuestion', companyQuestionSchema);

CompanyQuestion.collection.createIndex(
  { normalizedQuestion: 1, topic: 1, difficulty: 1, company: 1 },
  { unique: true, sparse: true, background: true }
).catch(err => console.log('Index error:', err.message));

export default CompanyQuestion;
