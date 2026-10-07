import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AptitudeQuestion from '../models/AptitudeQuestion.js';
import AptitudeAttempt from '../models/AptitudeAttempt.js';
import CompanyQuestion from '../models/CompanyQuestion.js';

import mongoose from 'mongoose';
import { generateQuestionsFromAI, generateTopicNotesFromAI } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentPath = path.join(__dirname, '../data/aptitudeContent.json');

// Helper to read static content
const getAptitudeContent = () => {
  try {
    const data = fs.readFileSync(contentPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading aptitude content:', error);
    return { categories: [], topics: {} };
  }
};

/**
 * @desc    Get all categories with basic progress
 * @route   GET /api/aptitude/categories
 * @access  Private
 */
export const getCategories = async (req, res) => {
  try {
    const content = getAptitudeContent();
    const categories = content.categories;

    let progressMap = {};
    // Only fetch progress if the user is logged in
    if (req.user) {
      const attempts = await AptitudeAttempt.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: '$category',
            totalAttempts: { $sum: 1 },
            correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } }
          }
        }
      ]);
      attempts.forEach(a => {
        progressMap[a._id] = {
          totalAttempts: a.totalAttempts,
          correctAnswers: a.correctAnswers,
          progressPercentage: a.totalAttempts > 0 ? Math.round((a.correctAnswers / a.totalAttempts) * 100) : 0
        };
      });
    }

    const categoriesWithProgress = categories.map(cat => ({
      ...cat,
      progress: progressMap[cat.id] || { totalAttempts: 0, correctAnswers: 0, progressPercentage: 0 }
    }));

    res.json({ success: true, categories: categoriesWithProgress });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get topics for a category
 * @route   GET /api/aptitude/categories/:categoryId/topics
 * @access  Private
 */
export const getCategoryTopics = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const content = getAptitudeContent();

    if (!content.topics[categoryId]) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const topics = content.topics[categoryId];

    let progressMap = {};
    if (req.user) {
      const attempts = await AptitudeAttempt.aggregate([
        { $match: { userId: req.user._id, category: categoryId } },
        {
          $group: {
            _id: '$topic',
            totalAttempts: { $sum: 1 },
            correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } }
          }
        }
      ]);
      attempts.forEach(a => {
        progressMap[a._id] = {
          totalAttempts: a.totalAttempts,
          correctAnswers: a.correctAnswers,
          progressPercentage: a.totalAttempts > 0 ? Math.round((a.correctAnswers / a.totalAttempts) * 100) : 0
        };
      });
    }

    const topicsList = topics.map(t => {
      const { content: _content, ...basicInfo } = t;
      return {
        ...basicInfo,
        progress: progressMap[t.id] || { totalAttempts: 0, correctAnswers: 0, progressPercentage: 0 }
      };
    });

    res.json({ success: true, topics: topicsList });
  } catch (error) {
    console.error('Error in getCategoryTopics:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get learning content for a topic
 * @route   GET /api/aptitude/topics/:categoryId/:topicId
 * @access  Private
 */
export const getTopicContent = async (req, res) => {
  try {
    const { categoryId, topicId } = req.params;
    const content = getAptitudeContent();

    const categoryTopics = content.topics[categoryId];
    if (!categoryTopics) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const topic = categoryTopics.find(t => t.id === topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    let progress = { totalAttempts: 0, correctAnswers: 0, accuracy: 0 };
    if (req.user) {
      const attempts = await AptitudeAttempt.aggregate([
        { $match: { userId: req.user._id, topic: topicId } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            correctAnswers: { $sum: { $cond: ['$isCorrect', 1, 0] } }
          }
        }
      ]);
      if (attempts.length > 0) {
        progress = {
          totalAttempts: attempts[0].totalAttempts,
          correctAnswers: attempts[0].correctAnswers,
          accuracy: Math.round((attempts[0].correctAnswers / attempts[0].totalAttempts) * 100)
        };
      }
    }

    res.json({ success: true, topic, progress });
  } catch (error) {
    console.error('Error in getTopicContent:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get practice questions for a topic
 * @route   GET /api/aptitude/questions?category=num&topic=perc&limit=10
 * @access  Private
 */

function normalizeQuestionText(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s%.-]/g, '').trim();
}

async function fetchOrGenerateQuestions(reqQuery, isCompany = false) {
  const { category, topic, difficulty, limit = 10, excludeIds, company, source } = reqQuery;
  const targetCount = Math.min(Math.max(Number(limit) || 10, 1), 20);

  const Model = isCompany ? CompanyQuestion : AptitudeQuestion;
  const filter = { active: true };
  if (category) filter.category = category;
  if (topic && topic !== 'All') filter.topic = topic;
  if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
  if (isCompany && company && company !== 'All') filter.company = company;
  if (isCompany && source && source !== 'All') {
    filter.questionType = source === 'Verified' ? 'Verified Actual' : 'Company-Style AI';
  }

  let excludeObjIds = [];
  if (excludeIds) {
    excludeObjIds = excludeIds.split(',').filter(id => id.length === 24).map(id => new mongoose.Types.ObjectId(id));
    if (excludeObjIds.length > 0) {
      filter._id = { $nin: excludeObjIds };
    }
  }

  // 1. Check existing questions
  const existingCount = await Model.countDocuments(filter);
  
  // 2. Replenish if missing
  if (existingCount < targetCount) {
    let missing = targetCount - existingCount;
    let attempts = 0;
    
    while (missing > 0 && attempts < 3) {
      attempts++;
      try {
        console.log(`[AI QUIZ] Topic: ${topic} | Difficulty: ${difficulty} | Existing: ${existingCount} | Missing: ${missing} | Generating...`);
        
        // Pass some existing questions to AI to avoid immediate duplicates
        const recentExisting = await Model.find(filter).select('question').limit(10);
        const existingTexts = recentExisting.map(q => q.question);

        // Generate missing + a small safety buffer (2)
        const generateCount = missing + 2;
        const aiBatch = await generateQuestionsFromAI(category, topic, difficulty, generateCount, isCompany, company, existingTexts);
        
        let validUnique = [];
        for (const q of aiBatch) {
          const norm = normalizeQuestionText(q.question);
          // Check DB
          const isDup = await Model.exists({ normalizedQuestion: norm, topic, difficulty, ...(isCompany && {company}) });
          if (!isDup) {
            q.normalizedQuestion = norm;
            validUnique.push(q);
          }
        }
        
        if (validUnique.length > 0) {
          await Model.insertMany(validUnique);
          console.log(`[AI QUIZ] Saved ${validUnique.length} unique questions.`);
          missing -= validUnique.length;
        } else {
          console.log(`[AI QUIZ] AI generated 0 unique/valid questions this round.`);
        }
      } catch (err) {
        console.error('[AI QUIZ] Generation attempt failed:', err.message);
        if (err.isRateLimit) break; // Don't loop endlessly if rate limited
      }
    }
  }

  // 3. Fetch exact requested amount (with projections applied for security)
  const finalQuestions = await Model.aggregate([
    { $match: filter },
    { $sample: { size: targetCount } },
    { $project: { correctAnswer: 0, explanation: 0, solution: 0, shortcut: 0 } }
  ]);
  
  return finalQuestions;
}

/**
 * @desc    Get practice questions for a topic (with AI auto-replenishment)
 * @route   GET /api/aptitude/questions
 * @access  Private
 */
export const getQuestions = async (req, res) => {
  try {
    const questions = await fetchOrGenerateQuestions(req.query, false);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get company-specific questions (with AI auto-replenishment)
 * @route   GET /api/aptitude/company-questions
 * @access  Private
 */
export const getCompanyQuestions = async (req, res) => {
  try {
    const questions = await fetchOrGenerateQuestions(req.query, true);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error in getCompanyQuestions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Generate new AI questions (Deprecated, kept for compatibility if needed)
 * @route   POST /api/aptitude/generate
 * @access  Private
 */
export const generateQuestions = async (req, res) => {
  return res.status(400).json({ success: false, message: 'Deprecated. Use GET /api/aptitude/questions with limit.' });
};

/**
 * @desc    Submit an attempt for a question
 * @route   POST /api/aptitude/attempt
 * @access  Private
 */
export const submitAttempt = async (req, res) => {
  try {
    const { questionId, selectedAnswer, timeTaken } = req.body;
    const userId = req.user._id;

    if (!questionId || !selectedAnswer) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let question = await AptitudeQuestion.findById(questionId);
    if (!question) {
      question = await CompanyQuestion.findById(questionId);
    }
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    // Save attempt
    const attempt = await AptitudeAttempt.create({
      userId,
      questionId,
      category: question.category,
      topic: question.topic,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      difficulty: question.difficulty,
      timeTaken: timeTaken || 0,
      company: (Array.isArray(question.company) ? question.company[0] : question.company) || 'General',
      questionType: question.questionType || 'General'
    });

    // Return result + explanations
    res.json({
      success: true,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      solution: question.solution,
      shortcut: question.shortcut
    });

  } catch (error) {
    console.error('Error in submitAttempt:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get overall aptitude progress for dashboard
 * @route   GET /api/aptitude/progress
 * @access  Private
 */
export const getOverallProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Overall stats
    const stats = await AptitudeAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          totalCorrect: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          totalTime: { $sum: '$timeTaken' }
        }
      }
    ]);

    // Category breakdown
    const categoryStats = await AptitudeAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      }
    ]);

    // Topic breakdown (to find strongest/weakest)
    const topicStats = await AptitudeAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { category: '$category', topic: '$topic' },
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      }
    ]);
    
    // Calculate accuracy for each topic
    const mappedTopics = topicStats.map(t => ({
      category: t._id.category,
      topic: t._id.topic,
      attempts: t.attempts,
      correct: t.correct,
      accuracy: t.attempts > 0 ? Math.round((t.correct / t.attempts) * 100) : 0
    }));

    const strongestTopics = [...mappedTopics].sort((a, b) => b.accuracy - a.accuracy).slice(0, 3);
    const weakestTopics = [...mappedTopics].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

    // Difficulty breakdown
    const difficultyStats = await AptitudeAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$difficulty',
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      }
    ]);

    // Company breakdown
    const companyStats = await AptitudeAttempt.aggregate([
      { $match: { userId, company: { $ne: 'General' } } },
      {
        $group: {
          _id: '$company',
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      }
    ]);

    // Recent activity (last 7 days by day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyStats = await AptitudeAttempt.aggregate([
      { $match: { userId, attemptedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$attemptedAt' } },
          attempts: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);



    const result = {
      overall: stats.length > 0 ? {
        totalAttempts: stats[0].totalAttempts,
        totalCorrect: stats[0].totalCorrect,
        accuracy: Math.round((stats[0].totalCorrect / stats[0].totalAttempts) * 100),
        totalTime: stats[0].totalTime
      } : { totalAttempts: 0, totalCorrect: 0, accuracy: 0, totalTime: 0 },
      categories: categoryStats,
      topics: {
        all: mappedTopics,
        strongest: strongestTopics,
        weakest: weakestTopics
      },
      difficulties: difficultyStats,
      companies: companyStats,
      daily: dailyStats
    };

    res.json({ success: true, progress: result });
  } catch (error) {
    console.error('Error in getOverallProgress:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Generate AI topic notes (formulas, concepts, shortcuts, mistakes)
 * @route   POST /api/aptitude/generate-notes
 * @access  Public
 */
export const generateTopicNotes = async (req, res) => {
  try {
    const { category, topicName } = req.body;
    if (!category || !topicName) {
      return res.status(400).json({ success: false, message: 'Missing category or topicName' });
    }
    const notes = await generateTopicNotesFromAI(category, topicName);
    res.json({ success: true, content: notes });
  } catch (error) {
    console.error('Error generating topic notes:', error.message);
    if (error.isRateLimit) {
      return res.status(503).json({ success: false, message: 'AI service temporarily busy. Please wait a moment and refresh.', isRateLimit: true });
    }
    res.status(500).json({ success: false, message: 'Failed to generate topic notes' });
  }
};
