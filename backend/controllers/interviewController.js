import InterviewSession from '../models/InterviewSession.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import {
  generateNextInterviewTurn,
  evaluateCompletedInterview,
} from '../services/interviewAIService.js';

/**
 * Start a new interview session
 * @route POST /api/interview/start
 */
export const startInterviewSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      mode = 'typing',
      interviewType = 'mixed',
      durationMinutes = 10,
      interviewerId = 'sarah',
    } = req.body;

    // Validate boundaries
    const safeDuration = Math.min(15, Math.max(5, Number(durationMinutes) || 10));

    // Fetch user resume if available for contextual questions
    const userResume = await Resume.findOne({ user: userId });

    // Initialize session
    const session = new InterviewSession({
      user: userId,
      mode,
      interviewType,
      durationMinutes: safeDuration,
      interviewerId,
      status: 'in_progress',
      startTime: new Date(),
      transcript: [],
    });

    // Generate first opening turn from AI interviewer
    const openingTurn = await generateNextInterviewTurn({
      interviewType,
      durationMinutes: safeDuration,
      transcript: [],
      studentName: req.user.name || 'Candidate',
      resumeContext: userResume,
    });

    session.transcript.push({
      speaker: 'ai',
      text: openingTurn.interviewerMessage,
      timestamp: new Date(),
      metrics: { topic: openingTurn.turnTopic },
    });

    await session.save();

    res.status(201).json({
      success: true,
      session,
      openingMessage: openingTurn.interviewerMessage,
    });
  } catch (error) {
    console.error('Error starting interview session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to start interview session',
    });
  }
};

/**
 * Server-side content moderation check
 * Detects profanity, abusive language, sexually explicit content, harassment, personal insults
 * @param {string} text - The candidate's message to check
 * @returns {{ isInappropriate: boolean, reason: string }}
 */
const moderateContent = (text) => {
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '');
  
  // Profanity / abusive words
  const profanityPatterns = [
    /\bf+u+c+k+/i, /\bs+h+i+t+/i, /\ba+s+s+h+o+l+e/i, /\bb+i+t+c+h/i,
    /\bd+a+m+n/i, /\bb+a+s+t+a+r+d/i, /\bd+i+c+k/i, /\bp+u+s+s+y/i,
    /\bc+u+n+t/i, /\bw+h+o+r+e/i, /\bs+l+u+t/i, /\bp+r+i+c+k/i,
    /\bc+o+c+k/i, /\bt+w+a+t/i, /\bw+a+n+k/i, /\bb+o+l+l+o+c+k/i,
    /\bm+o+t+h+e+r+f/i, /\bn+i+g+g/i, /\bf+a+g+/i, /\br+e+t+a+r+d/i,
    /\bid+i+o+t/i, /\bs+t+u+p+i+d/i, /\bd+u+m+b+a+s+s/i,
    /\bk+i+l+l\s*(you|your|u)/i, /\bdie\b/i, /\bsuicide/i,
    /\bsex/i, /\bporn/i, /\bnude/i, /\bnaked/i, /\borgasm/i,
    /\brape/i, /\bmolest/i,
    /\bchutiya/i, /\bmadarchod/i, /\bbhenchod/i, /\bgaand/i, /\bland/i,
    /\bbhosdike/i, /\bharamkhor/i, /\bsaala/i,
  ];
  
  for (const pattern of profanityPatterns) {
    if (pattern.test(text)) {
      return { isInappropriate: true, reason: 'Profanity or abusive language detected' };
    }
  }
  
  return { isInappropriate: false, reason: '' };
};

/**
 * Post student answer and receive AI interviewer follow-up
 * @route POST /api/interview/:sessionId/turn
 */
export const handleInterviewTurn = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { studentAnswer = '', metrics = {}, isEnding = false } = req.body;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Reject if session is already completed/terminated
    if (['completed', 'terminated', 'terminated_inappropriate'].includes(session.status)) {
      return res.status(400).json({ success: false, message: 'Interview is already completed or terminated' });
    }

    // ── SERVER-SIDE TIMER VALIDATION ─────────────────────────────────────────
    const elapsedMs = Date.now() - new Date(session.startTime).getTime();
    const durationMs = session.durationMinutes * 60 * 1000;
    const timeRemainingMs = durationMs - elapsedMs;

    if (timeRemainingMs <= 0) {
      session.status = 'completed';
      session.terminationReason = 'time_expired';
      session.endTime = new Date();
      await session.save();
      return res.json({
        success: true,
        timeExpired: true,
        transcript: session.transcript,
        message: 'Interview time has expired.',
      });
    }

    // ── SERVER-SIDE MODERATION ────────────────────────────────────────────────
    if (studentAnswer.trim()) {
      const modResult = moderateContent(studentAnswer);
      if (modResult.isInappropriate) {
        session.status = 'terminated_inappropriate';
        session.terminationReason = modResult.reason;
        session.endTime = new Date();
        // Add the inappropriate message to transcript for record-keeping (marked)
        session.transcript.push({
          speaker: 'student',
          text: studentAnswer.trim(),
          timestamp: new Date(),
          metrics: { ...metrics, flagged: true, flagReason: modResult.reason },
        });
        await session.save();
        return res.json({
          success: true,
          terminated: true,
          terminationReason: 'inappropriate_language',
          transcript: session.transcript,
          message: 'Interview terminated due to inappropriate language.',
        });
      }
    }

    // Append student turn if provided
    if (studentAnswer.trim()) {
      session.transcript.push({
        speaker: 'student',
        text: studentAnswer.trim(),
        timestamp: new Date(),
        metrics,
      });
    }

    // Extract the last AI question for relevance checking
    const lastAiTurn = [...session.transcript].reverse().find(t => t.speaker === 'ai');
    const lastAiQuestion = lastAiTurn?.text || '';

    // Fetch resume for contextual follow-up questions
    const userResume = await Resume.findOne({ user: userId });

    const timeRemainingSeconds = Math.max(0, Math.floor(timeRemainingMs / 1000));

    // Generate AI response
    const nextTurn = await generateNextInterviewTurn({
      interviewType: session.interviewType,
      durationMinutes: session.durationMinutes,
      transcript: session.transcript,
      studentName: req.user.name || 'Candidate',
      resumeContext: userResume,
      isEnding,
      lastAiQuestion,
      timeRemainingSeconds,
    });

    // ── POST-AI TIMER CHECK ──────────────────────────────────────────────────
    // Check timer again after AI response generation (race-condition protection)
    const postAiElapsed = Date.now() - new Date(session.startTime).getTime();
    if (postAiElapsed >= durationMs) {
      session.status = 'completed';
      session.terminationReason = 'time_expired';
      session.endTime = new Date();
      await session.save();
      return res.json({
        success: true,
        timeExpired: true,
        transcript: session.transcript,
        message: 'Interview time expired during AI processing.',
      });
    }

    session.transcript.push({
      speaker: 'ai',
      text: nextTurn.interviewerMessage,
      timestamp: new Date(),
      metrics: { topic: nextTurn.turnTopic },
    });

    await session.save();

    res.json({
      success: true,
      aiResponse: nextTurn,
      transcript: session.transcript,
    });
  } catch (error) {
    console.error('Error handling interview turn:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process interview turn',
    });
  }
};


/**
 * Finalize and evaluate completed interview session
 * @route POST /api/interview/:sessionId/evaluate
 */
export const evaluateInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { speechMetrics = {}, visualMetrics = {}, coachingEvents = [] } = req.body;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    // Update metrics and coaching logs
    session.speechMetrics = { ...session.speechMetrics.toObject(), ...speechMetrics };
    session.visualMetrics = { ...session.visualMetrics.toObject(), ...visualMetrics };
    if (Array.isArray(coachingEvents) && coachingEvents.length > 0) {
      session.coachingEvents = coachingEvents;
    }

    // Fetch resume
    const userResume = await Resume.findOne({ user: userId });

    // Run AI Evaluation
    const evaluation = await evaluateCompletedInterview({
      mode: session.mode,
      interviewType: session.interviewType,
      transcript: session.transcript,
      speechMetrics: session.speechMetrics,
      visualMetrics: session.visualMetrics,
      coachingEvents: session.coachingEvents,
      studentName: req.user.name || 'Candidate',
      resumeContext: userResume,
    });

    session.evaluation = evaluation;
    session.status = 'completed';
    session.endTime = new Date();

    await session.save();

    // Push high-level summary to User.interviewHistory
    await User.findByIdAndUpdate(userId, {
      $push: {
        interviewHistory: {
          sessionId: session._id,
          mode: session.mode,
          interviewType: session.interviewType,
          overallScore: evaluation.overallScore,
          date: new Date(),
        },
      },
    });

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error evaluating interview:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate interview evaluation',
    });
  }
};

/**
 * Get interview history for student
 * @route GET /api/interview/history
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await InterviewSession.find({ user: userId, status: 'completed' })
      .select('mode interviewType durationMinutes startTime endTime evaluation.overallScore evaluation.categoryScores createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch interview history',
    });
  }
};

/**
 * Get single interview session details and report
 * @route GET /api/interview/:sessionId
 */
export const getInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const session = await InterviewSession.findOne({ _id: sessionId, user: userId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error fetching interview session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch interview session',
    });
  }
};
