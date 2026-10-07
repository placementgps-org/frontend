import express from 'express';
import {
  getCategories,
  getCategoryTopics,
  getTopicContent,
  getQuestions,
  generateQuestions,
  getCompanyQuestions,
  submitAttempt,
  getOverallProgress
} from '../controllers/aptitudeController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── PUBLIC ROUTES (auth optional — logged-in users see progress data) ─────────
router.get('/categories', optionalProtect, getCategories);
router.get('/categories/:categoryId/topics', optionalProtect, getCategoryTopics);
router.get('/topics/:categoryId/:topicId', optionalProtect, getTopicContent);

// ── PROTECTED ROUTES (auth required) ──────────────────────────────────────────
// All routes below this point require a valid JWT
router.use(protect);

router.get('/questions', getQuestions);
router.post('/generate', generateQuestions);
router.get('/company-questions', getCompanyQuestions);
router.post('/attempt', submitAttempt);
router.get('/progress', getOverallProgress);


export default router;
