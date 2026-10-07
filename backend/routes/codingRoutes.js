import express from 'express';
import {
  getTopics,
  getOrGenerateChallenge,
  runCode,
  submitCode,
  getUserProgress
} from '../controllers/codingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { rateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public topics endpoint
router.get('/topics', getTopics);

// Protected challenge & execution routes
router.post('/challenge', protect, rateLimiter(20, 60 * 1000), getOrGenerateChallenge);
router.post('/run', protect, rateLimiter(30, 60 * 1000), runCode);
router.post('/submit', protect, rateLimiter(20, 60 * 1000), submitCode);
router.get('/progress', protect, getUserProgress);

export default router;
