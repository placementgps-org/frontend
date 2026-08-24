import mongoose from 'mongoose';

const aptitudeQuestionSchema = new mongoose.Schema(
  {
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
    company: {
      type: [String],
      default: ['General'],
    },
    year: {
      type: Number,
    },
    tags: {
      type: [String],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    concept: {
      type: String,
    },
    estimatedTime: {
      type: Number, // in seconds
    },
    sourceType: {
      type: String,
      default: 'General',
    },
    generatedByAI: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const AptitudeQuestion = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);

AptitudeQuestion.collection.createIndex(
  { normalizedQuestion: 1, topic: 1, difficulty: 1 },
  { unique: true, sparse: true, background: true }
).catch(err => console.log('Index error:', err.message));

export default AptitudeQuestion;
