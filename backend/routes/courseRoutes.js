import express from 'express';
import { getCourses, getCourseById, getCourseRecommendations } from '../controllers/courseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// IMPORTANT: specific routes MUST come before /:id to avoid being caught by it
router.get('/', getCourses);
router.get('/recommend', getCourseRecommendations);
router.post('/recommend', getCourseRecommendations);
router.get('/:id', getCourseById);

export default router;

