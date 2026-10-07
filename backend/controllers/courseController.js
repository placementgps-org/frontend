import Course from '../models/Course.js';

/**
 * @desc    Get courses with filtering, searching and pagination
 * @route   GET /api/courses
 * @access  Public
 */
export const getCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '', 
      department = '', 
      difficulty = '', 
      provider = '' 
    } = req.query;

    const query = { active: true };

    // Exact match filters
    if (category) query.category = category;
    if (department) query.department = department;
    if (difficulty) query.difficulty = difficulty;
    if (provider) query.provider = provider;

    // Search query using regex for partial matches across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { courseName: searchRegex },
        { provider: searchRegex },
        { skills: searchRegex },
        { category: searchRegex },
        { department: searchRegex }
      ];
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const courses = await Course.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data: courses
    });

  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get single course by ID
 * @route   GET /api/courses/:id
 * @access  Public
 */
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get course recommendations based on role, stage, topics and skills
 * @route   GET/POST /api/courses/recommend
 * @access  Public
 */
import { getRecommendedCoursesForStage } from '../services/courseMatchingService.js';

export const getCourseRecommendations = async (req, res) => {
  try {
    const role = req.body.role || req.query.role || '';
    const stage = req.body.stage || req.query.stage || '';
    const skills = req.body.skills || (req.query.skills ? req.query.skills.split(',') : []);
    const topics = req.body.topics || (req.query.topics ? req.query.topics.split(',') : []);
    const limit = parseInt(req.body.limit || req.query.limit || 6, 10);

    const recommended = await getRecommendedCoursesForStage({
      careerId: role,
      stageId: stage,
      stageTitle: stage,
      stageTopics: [...skills, ...topics],
      limit
    });

    res.status(200).json({
      success: true,
      count: recommended.length,
      data: recommended
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error recommending courses', error: error.message });
  }
};

