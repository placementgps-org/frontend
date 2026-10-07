import mongoose from 'mongoose';

/**
 * Schema to record student coding runs and submissions.
 */
const codingAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CodingChallenge',
      required: true,
      index: true
    },
    track: {
      type: String,
      enum: ['programming', 'dsa'],
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    language: {
      type: String,
      required: true
    },
    submittedCode: {
      type: String,
      required: true
    },
    isRunOnly: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: [
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Runtime Error',
        'Compilation Error',
        'Memory Limit Exceeded'
      ],
      required: true
    },
    passedTests: {
      type: Number,
      default: 0
    },
    totalTests: {
      type: Number,
      default: 0
    },
    executionTimeMs: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for user attempts lookup
codingAttemptSchema.index({ user: 1, topic: 1, createdAt: -1 });
codingAttemptSchema.index({ user: 1, challenge: 1 });

const CodingAttempt = mongoose.model('CodingAttempt', codingAttemptSchema);

export default CodingAttempt;
