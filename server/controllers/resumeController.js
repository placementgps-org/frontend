import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { extractResumeText } from '../utils/resumeParser.js';
import { analyzeResumeWithAI, matchFreeCoursesForResume } from '../services/resumeAnalysisService.js';
import { processCareerAssistantQuery } from '../services/resumeAssistantService.js';
import { getRoadmapTemplate } from '../data/roadmapTemplates.js';

/**
 * @desc    Upload resume, extract text, run AI analysis, match free courses, and save
 * @route   POST /api/resume/upload
 * @access  Private (JWT Protected)
 */
export const uploadAndAnalyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF or DOCX file.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // 1. Extract plain text from uploaded buffer
    let extractedText = '';
    try {
      extractedText = await extractResumeText(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
    } catch (parseErr) {
      console.error('[resumeController] Text extraction error:', parseErr.message);
      return res.status(422).json({
        success: false,
        message: parseErr.message || 'Failed to extract text from your resume file. Please ensure it is not scanned as an image.'
      });
    }

    // 2. Build student context from roadmap and profile
    let targetCareer = '';
    if (user.roadmapProgress?.targetCareerId) {
      const template = getRoadmapTemplate(user.roadmapProgress.targetCareerId);
      targetCareer = template?.title || user.roadmapProgress.targetCareerId;
    }

    const userContext = {
      name: user.name,
      targetCareer
    };

    // 3. Run multi-dimensional AI analysis
    const aiAnalysis = await analyzeResumeWithAI(extractedText, userContext);

    // 4. Match free courses from the 141-course MongoDB catalog
    const courseRecommendations = await matchFreeCoursesForResume(aiAnalysis, targetCareer);
    aiAnalysis.courseRecommendations = courseRecommendations;

    // 5. Replace / update active Resume document for this user
    const resumeData = {
      user: user._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      analysis: aiAnalysis,
      analyzedAt: new Date(),
      active: true
    };

    const savedResume = await Resume.findOneAndUpdate(
      { user: user._id },
      { $set: resumeData },
      { upsert: true, new: true, runValidators: true }
    );

    // 6. Update user's resumeUploaded flag
    user.resumeUploaded = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: savedResume
    });

  } catch (error) {
    console.error('[resumeController] uploadAndAnalyzeResume error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while analyzing resume'
    });
  }
};

/**
 * @desc    Get the authenticated user's latest saved resume & analysis
 * @route   GET /api/resume/me
 * @access  Private (JWT Protected)
 */
export const getMyResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user._id, active: true }).lean();

    if (!resume) {
      return res.status(200).json({
        success: true,
        hasResume: false,
        data: null
      });
    }

    res.status(200).json({
      success: true,
      hasResume: true,
      data: resume
    });

  } catch (error) {
    console.error('[resumeController] getMyResume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving resume analysis'
    });
  }
};

/**
 * @desc    Delete/clear user's active resume
 * @route   DELETE /api/resume/me
 * @access  Private (JWT Protected)
 */
export const deleteMyResume = async (req, res) => {
  try {
    await Resume.findOneAndDelete({ user: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { resumeUploaded: false });

    res.status(200).json({
      success: true,
      message: 'Resume removed successfully'
    });

  } catch (error) {
    console.error('[resumeController] deleteMyResume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing resume'
    });
  }
};

/**
 * @desc    AI Career Assistant chat & course evaluation
 * @route   POST /api/resume/assistant/chat
 * @access  Private (JWT Protected)
 */
export const chatWithCareerAssistant = async (req, res) => {
  try {
    const { message, conversationHistory = [], courseId, courseName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Retrieve student's latest active resume and analysis
    const resume = await Resume.findOne({ user: req.user._id, active: true }).lean();

    let targetCareer = '';
    if (user.roadmapProgress?.targetCareerId) {
      const template = getRoadmapTemplate(user.roadmapProgress.targetCareerId);
      targetCareer = template?.title || user.roadmapProgress.targetCareerId;
    }

    const userContext = {
      name: user.name,
      targetCareer
    };

    const response = await processCareerAssistantQuery({
      resume,
      userContext,
      message,
      conversationHistory,
      courseId,
      courseName
    });

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('[resumeController] chatWithCareerAssistant error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error in AI Career Assistant'
    });
  }
};

