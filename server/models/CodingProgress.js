import mongoose from 'mongoose';

/**
 * Schema to track aggregated student progress in Coding Practice.
 */
const codingProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    totalSolved: {
      type: Number,
      default: 0
    },
    totalAttempted: {
      type: Number,
      default: 0
    },
    programmingSolved: {
      type: Number,
      default: 0
    },
    dsaSolved: {
      type: Number,
      default: 0
    },
    easySolved: {
      type: Number,
      default: 0
    },
    mediumSolved: {
      type: Number,
      default: 0
    },
    hardSolved: {
      type: Number,
      default: 0
    },
    solvedChallenges: [
      {
        challenge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CodingChallenge'
        },
        challengeId: {
          type: String,
          required: true
        },
        track: {
          type: String,
          enum: ['programming', 'dsa']
        },
        topic: String,
        difficulty: String,
        language: String,
        solvedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    topicStats: {
      type: Map,
      of: new mongoose.Schema(
        {
          attempted: { type: Number, default: 0 },
          solved: { type: Number, default: 0 },
          consecutiveSuccesses: { type: Number, default: 0 },
          consecutiveFailures: { type: Number, default: 0 },
          recommendedDifficulty: { type: String, default: 'Easy' }
        },
        { _id: false }
      ),
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const CodingProgress = mongoose.model('CodingProgress', codingProgressSchema);

export default CodingProgress;
