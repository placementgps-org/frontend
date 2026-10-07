import express from 'express';
import {
  startInterviewSession,
  handleInterviewTurn,
  evaluateInterview,
  getInterviewHistory,
  getInterviewSession,
} from '../controllers/interviewController.js';
import { generateAvatarSpeakingVideo } from '../controllers/avatarVideoController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Avatar video generation supports both authenticated students and demo sessions
router.post('/avatar-video/generate', optionalProtect, generateAvatarSpeakingVideo);

// Standard interview session routes require student authentication
router.use(protect);

router.post('/start', startInterviewSession);
router.post('/:sessionId/turn', handleInterviewTurn);
router.post('/:sessionId/evaluate', evaluateInterview);
router.get('/history', getInterviewHistory);
router.get('/:sessionId', getInterviewSession);

export default router;
