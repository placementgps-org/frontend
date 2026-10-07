import express from 'express';
import { 
  getRoadmap, 
  updateTargetCareer, 
  updateTopicProgress, 
  getRecommendedCourses,
  saveCustomRoadmap,
  getKnownCareers
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRoadmap);
router.post('/career', updateTargetCareer);
router.post('/topic', updateTopicProgress);
router.get('/recommended-courses', getRecommendedCourses);
router.post('/custom', saveCustomRoadmap);
router.get('/careers', getKnownCareers);

export default router;
