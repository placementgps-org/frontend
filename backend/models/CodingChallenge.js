import mongoose from 'mongoose';

/**
 * Schema for Coding Challenges (Programming and DSA).
 * Contains problem metadata, descriptions, test cases, and starter templates.
 */
const codingChallengeSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    track: {
      type: String,
      enum: ['programming', 'dsa'],
      required: true,
      index: true
    },
    topic: {
      type: String,
      required: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    inputFormat: {
      type: String,
      default: ''
    },
    outputFormat: {
      type: String,
      default: ''
    },
    constraints: {
      type: [String],
      default: []
    },
    examples: [
      {
        input: { type: String, default: '' },
        output: { type: String, default: '' },
        explanation: { type: String, default: '' }
      }
    ],
    visibleTestCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true }
      }
    ],
    // Hidden test cases are never sent to the client
    hiddenTestCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true }
      }
    ],
    starterTemplates: {
      python: { type: String, default: '' },
      javascript: { type: String, default: '' },
      java: { type: String, default: '' },
      cpp: { type: String, default: '' }
    },
    referenceSolution: {
      language: { type: String, default: 'python' },
      code: { type: String, default: '' }
    },
    hints: {
      type: [String],
      default: []
    },
    tags: {
      type: [String],
      default: []
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    totalAccepted: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: String,
      enum: ['ai', 'system'],
      default: 'ai'
    }
  },
  {
    timestamps: true
  }
);

// Method to return client-safe challenge object (hiding hidden test cases and reference solutions)
codingChallengeSchema.methods.toClientJSON = function () {
  const obj = this.toObject();
  delete obj.hiddenTestCases;
  delete obj.referenceSolution;
  return obj;
};

// Compound index for lightning-fast pool searches
codingChallengeSchema.index({ track: 1, topic: 1, difficulty: 1, createdAt: -1 });
codingChallengeSchema.index({ topic: 1, title: 1 });

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);

export default CodingChallenge;
