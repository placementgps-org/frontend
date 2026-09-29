import mongoose from 'mongoose';

/**
 * InterviewSession Schema
 * Stores complete interview records for text and speaking mock interviews.
 * Contains transcript turns, derived audio/visual metrics, real-time coaching events,
 * and structured evidence-based evaluations.
 */
const transcriptItemSchema = new mongoose.Schema({
  speaker: {
    type: String,
    enum: ['ai', 'student'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metrics: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
}, { _id: false });

const coachingEventSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  priority: {
    type: String,
    enum: ['critical', 'important', 'minor'],
    default: 'important',
  },
  type: {
    type: String,
    enum: ['eye_contact', 'volume', 'pacing', 'gesture', 'framing', 'general'],
    default: 'general',
  },
  message: {
    type: String,
    required: true,
  }
}, { _id: false });

const evidenceObservationSchema = new mongoose.Schema({
  topic: { type: String, default: '' },
  whatHappened: { type: String, required: true },
  whyItMatters: { type: String, required: true },
  howToImprove: { type: String, required: true },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  mode: {
    type: String,
    enum: ['typing', 'speaking'],
    required: true,
  },
  interviewType: {
    type: String,
    enum: ['hr', 'personal', 'mixed'],
    default: 'mixed',
  },
  durationMinutes: {
    type: Number,
    min: 5,
    max: 15,
    default: 10,
  },
  interviewerId: {
    type: String,
    default: 'sarah',
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned', 'terminated', 'terminated_inappropriate'],
    default: 'in_progress',
  },
  terminationReason: {
    type: String,
    default: '',
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  transcript: [transcriptItemSchema],
  speechMetrics: {
    avgWpm: { type: Number, default: 0 },
    paceRating: { type: String, default: 'Normal' },
    pauseCount: { type: Number, default: 0 },
    fillerWordCount: { type: Number, default: 0 },
    fillerWords: { type: [String], default: [] },
    volumeLevel: { type: String, default: 'Balanced' },
    clarityScore: { type: Number, default: 0 },
    isEvaluated: { type: Boolean, default: false },
  },
  visualMetrics: {
    cameraAttentionPercent: { type: Number, default: 0 },
    gazeDeviations: { type: Number, default: 0 },
    postureConsistency: { type: Number, default: 0 },
    distractingGesturesCount: { type: Number, default: 0 },
    faceFramingPercent: { type: Number, default: 0 },
    isEvaluated: { type: Boolean, default: false },
  },
  coachingEvents: [coachingEventSchema],
  avatarVideoMetrics: {
    totalVideoSeconds: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    generatedClipsCount: { type: Number, default: 0 },
    cacheHitsCount: { type: Number, default: 0 },
  },
  evaluation: {
    overallScore: { type: Number, default: 0 },
    categoryScores: {
      communication: { type: Number, default: 0 },
      answerQuality: { type: Number, default: 0 },
      professionalism: { type: Number, default: 0 },
      relevance: { type: Number, default: 0 },
      voiceDelivery: { type: Number, default: 0 },
      eyeContact: { type: Number, default: 0 },
      bodyLanguage: { type: Number, default: 0 },
      interviewBehavior: { type: Number, default: 0 },
      followUpHandling: { type: Number, default: 0 },
    },
    categoryExplanations: {
      communication: { type: String, default: '' },
      answerQuality: { type: String, default: '' },
      professionalism: { type: String, default: '' },
      relevance: { type: String, default: '' },
      voiceDelivery: { type: String, default: '' },
      eyeContact: { type: String, default: '' },
      bodyLanguage: { type: String, default: '' },
      interviewBehavior: { type: String, default: '' },
      followUpHandling: { type: String, default: '' },
    },
    strengths: { type: [String], default: [] },
    areasToImprove: { type: [String], default: [] },
    personalizedPlan: { type: [String], default: [] },
    evidenceObservations: [evidenceObservationSchema],
  }
}, {
  timestamps: true,
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;
