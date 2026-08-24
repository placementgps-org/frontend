import mongoose from 'mongoose';

const aptitudeAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AptitudeQuestion',
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
    selectedAnswer: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    company: {
      type: String,
      default: 'General'
    },
    questionType: {
      type: String,
      default: 'General'
    }
  },
  {
    timestamps: { createdAt: 'attemptedAt', updatedAt: false }, // Use attemptedAt instead of createdAt
  }
);

// Compound index for quick progress aggregation
aptitudeAttemptSchema.index({ userId: 1, category: 1, topic: 1 });
aptitudeAttemptSchema.index({ userId: 1, attemptedAt: -1 });

const AptitudeAttempt = mongoose.model('AptitudeAttempt', aptitudeAttemptSchema);

export default AptitudeAttempt;
