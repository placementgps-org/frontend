import express from 'express';
import { handleChat, handleGenerateCustomRoadmap } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, handleChat);
router.post('/generate-roadmap', protect, handleGenerateCustomRoadmap);

export default router;
