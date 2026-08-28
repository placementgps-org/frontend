import CodingChallenge from '../models/CodingChallenge.js';
import CodingAttempt from '../models/CodingAttempt.js';
import CodingProgress from '../models/CodingProgress.js';
import { executeCodeOnTestCases } from '../services/codeExecutionService.js';
import {
  CODING_TOPICS,
  generateAndValidateCodingChallenge,
  triggerBackgroundPreGeneration,
  recordChallengeSubmission
} from '../services/codingChallengeService.js';

/**
 * @desc    Get supported tracks and topic taxonomies
 * @route   GET /api/coding/topics
 * @access  Public / Private
 */
export const getTopics = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: CODING_TOPICS
    });
  } catch (err) {
    console.error('[CodingController] getTopics error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load coding topics'
    });
  }
};

/**
 * @desc    Get or dynamically generate an AI coding challenge with instant cache & background pre-generation
 * @route   POST /api/coding/challenge
 * @access  Private
 */
export const getOrGenerateChallenge = async (req, res) => {
  const reqStart = Date.now();
  try {
    const {
      track = 'programming',
      topic = 'Arrays & Lists',
      difficulty = 'Easy',
      challengeId = null,
      forceNew = false
    } = req.body;

    const userId = req.user?._id;

    // 1. Explicit challengeId requested
    if (challengeId) {
      const dbStart = Date.now();
      const existing = await CodingChallenge.findOne({ challengeId });
      const dbMs = Date.now() - dbStart;

      if (existing) {
        console.log(`[CodingPerf] ⚡ Explicit challenge load (${existing.challengeId}) | DB: ${dbMs}ms | Total: ${Date.now() - reqStart}ms`);
        return res.status(200).json({
          success: true,
          data: existing.toClientJSON(),
          isCached: true
        });
      }
    }

    // 2. Fetch user's recent attempts & solved challenges to avoid repeating questions
    const dbStart = Date.now();
    let recentTitles = [];
    if (userId) {
      const [recentAttempts, userProgress] = await Promise.all([
        CodingAttempt.find({ user: userId, topic })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('challenge', 'title')
          .lean(),
        CodingProgress.findOne({ user: userId }).lean()
      ]);

      const attemptTitles = recentAttempts.map((a) => a.challenge?.title).filter(Boolean);
      const solvedIds = (userProgress?.solvedChallenges || []).map((sc) => sc.challengeId);

      recentTitles = Array.from(new Set(attemptTitles));

      // 3. Fast-Path: Check MongoDB buffer pool for an un-attempted challenge
      const candidate = await CodingChallenge.findOne({
        track,
        topic,
        difficulty,
        title: { $nin: recentTitles },
        challengeId: { $nin: solvedIds }
      })
        .sort({ createdAt: -1 })
        .lean();

      if (candidate) {
        const dbMs = Date.now() - dbStart;
        const totalMs = Date.now() - reqStart;
        console.log(`[CodingPerf] ⚡ FAST CACHE HIT: "${candidate.title}" (${track}/${topic}/${difficulty}) | DB: ${dbMs}ms | Total: ${totalMs}ms`);

        // Client safe transformation
        delete candidate.hiddenTestCases;
        delete candidate.referenceSolution;

        // Non-blocking background pre-generation to replenish pool
        triggerBackgroundPreGeneration({ track, topic, difficulty, userId });

        return res.status(200).json({
          success: true,
          data: candidate,
          isCached: true,
          loadTimeMs: totalMs
        });
      }
    }

    // 4. If no un-attempted challenge in pool (or forceNew and pool exhausted), generate dynamically with AI
    console.log(`[CodingController] 🚀 Pool empty for ${track} -> ${topic} (${difficulty}). Generating dynamic AI challenge...`);
    const newChallenge = await generateAndValidateCodingChallenge({
      track,
      topic,
      difficulty,
      userId,
      recentTitles
    });

    const totalMs = Date.now() - reqStart;
    console.log(`[CodingPerf] ✨ Fresh AI Generation returned to client | Total: ${totalMs}ms`);

    // Queue background pre-generation for the NEXT challenge so pool is ready
    triggerBackgroundPreGeneration({ track, topic, difficulty, userId });

    return res.status(201).json({
      success: true,
      data: newChallenge.toClientJSON(),
      isNew: true,
      loadTimeMs: totalMs
    });
  } catch (err) {
    console.error('[CodingController] getOrGenerateChallenge error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Unable to generate a new challenge right now. Please try again.'
    });
  }
};

/**
 * @desc    Run code against visible test cases (for student debugging)
 * @route   POST /api/coding/run
 * @access  Private
 */
export const runCode = async (req, res) => {
  try {
    const { challengeId, code, language = 'python' } = req.body;

    if (!challengeId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Challenge ID and code are required'
      });
    }

    const challenge = await CodingChallenge.findOne({ challengeId });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Execute untrusted code against visible test cases only
    const executionResult = await executeCodeOnTestCases({
      language,
      code,
      testCases: challenge.visibleTestCases
    });

    // Record run attempt
    if (req.user?._id) {
      await CodingAttempt.create({
        user: req.user._id,
        challenge: challenge._id,
        track: challenge.track,
        topic: challenge.topic,
        difficulty: challenge.difficulty,
        language,
        submittedCode: code,
        isRunOnly: true,
        status: executionResult.overallStatus,
        passedTests: executionResult.passedCount,
        totalTests: executionResult.totalCount,
        executionTimeMs: executionResult.results.reduce((acc, r) => acc + (r.executionTimeMs || 0), 0)
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        allPassed: executionResult.allPassed,
        passedCount: executionResult.passedCount,
        totalCount: executionResult.totalCount,
        overallStatus: executionResult.overallStatus,
        compileError: executionResult.compileError || null,
        results: executionResult.results
      }
    });
  } catch (err) {
    console.error('[CodingController] runCode error:', err);
    return res.status(500).json({
      success: false,
      message: 'Code execution failed. Please try again.'
    });
  }
};

/**
 * @desc    Submit code against visible + hidden test cases for final grading
 * @route   POST /api/coding/submit
 * @access  Private
 */
export const submitCode = async (req, res) => {
  try {
    const { challengeId, code, language = 'python' } = req.body;

    if (!challengeId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Challenge ID and code are required'
      });
    }

    const challenge = await CodingChallenge.findOne({ challengeId });
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    const allTestCases = [
      ...(challenge.visibleTestCases || []),
      ...(challenge.hiddenTestCases || [])
    ];

    const visibleCount = challenge.visibleTestCases?.length || 0;
    const hiddenCount = challenge.hiddenTestCases?.length || 0;

    // Execute code against all test cases
    const executionResult = await executeCodeOnTestCases({
      language,
      code,
      testCases: allTestCases
    });

    const isAccepted = executionResult.allPassed && executionResult.passedCount === allTestCases.length;

    // Record submission and update progress
    const submissionStats = await recordChallengeSubmission({
      userId: req.user?._id,
      challenge,
      language,
      submittedCode: code,
      isRunOnly: false,
      executionResult
    });

    // Format safe response (NEVER reveal hidden test cases, expected outputs or complete answers)
    const visibleResults = executionResult.results.slice(0, visibleCount);
    const hiddenResultsSummary = {
      totalHidden: hiddenCount,
      hiddenPassed: executionResult.results.slice(visibleCount).filter((r) => r.passed).length
    };

    let feedbackMessage = '';
    if (isAccepted) {
      feedbackMessage = '🎉 Excellent! All visible and hidden test cases passed successfully!';
      // Also trigger background pre-generation of the next challenge for the student
      triggerBackgroundPreGeneration({
        track: challenge.track,
        topic: challenge.topic,
        difficulty: challenge.difficulty,
        userId: req.user?._id
      });
    } else if (executionResult.overallStatus === 'Compilation Error') {
      feedbackMessage = 'Compilation Error: Please check your syntax and language requirements.';
    } else if (executionResult.overallStatus === 'Time Limit Exceeded') {
      feedbackMessage = 'Time Limit Exceeded: Your solution exceeded the execution time limit. Consider optimizing time complexity.';
    } else if (executionResult.passedCount >= visibleCount) {
      feedbackMessage = 'Visible tests passed, but your solution failed on some hidden edge cases or boundary conditions.';
    } else {
      feedbackMessage = 'Your solution failed on some test cases. Review the visible test outputs to debug your logic.';
    }

    return res.status(200).json({
      success: true,
      data: {
        isAccepted,
        overallStatus: isAccepted ? 'Accepted' : executionResult.overallStatus,
        passedCount: executionResult.passedCount,
        totalCount: allTestCases.length,
        executionTimeMs: submissionStats.executionTimeMs,
        feedback: feedbackMessage,
        compileError: executionResult.compileError || null,
        visibleResults,
        hiddenSummary: hiddenResultsSummary
      }
    });
  } catch (err) {
    console.error('[CodingController] submitCode error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process submission. Please try again.'
    });
  }
};

/**
 * @desc    Get user's coding practice progress and topic statistics
 * @route   GET /api/coding/progress
 * @access  Private
 */
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    let progress = await CodingProgress.findOne({ user: userId });
    if (!progress) {
      progress = await CodingProgress.create({ user: userId });
    }

    // Convert topicStats Map to plain object for JSON response
    const topicStatsObj = {};
    if (progress.topicStats) {
      for (const [k, v] of progress.topicStats.entries()) {
        topicStatsObj[k] = v;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalSolved: progress.totalSolved || 0,
        totalAttempted: progress.totalAttempted || 0,
        programmingSolved: progress.programmingSolved || 0,
        dsaSolved: progress.dsaSolved || 0,
        easySolved: progress.easySolved || 0,
        mediumSolved: progress.mediumSolved || 0,
        hardSolved: progress.hardSolved || 0,
        solvedChallengeIds: (progress.solvedChallenges || []).map((sc) => sc.challengeId),
        topicStats: topicStatsObj
      }
    });
  } catch (err) {
    console.error('[CodingController] getUserProgress error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load progress'
    });
  }
};
