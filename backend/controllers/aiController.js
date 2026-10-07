import { chatWithCareerAdvisor, generateCustomRoadmap } from '../services/aiService.js';
import User from '../models/User.js';

export const handleChat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'Messages array is required' });
    }

    const user = await User.findById(req.user._id);
    let userContext = `User: ${user.name}`;

    if (user.roadmapProgress?.targetCareerId) {
      userContext += `\nCurrently following roadmap: ${user.roadmapProgress.targetCareerId}`;
      const completed = user.roadmapProgress.completedTopics?.length || 0;
      if (completed > 0) userContext += `\nCompleted ${completed} topics so far.`;
    }

    const aiResponse = await chatWithCareerAdvisor(messages, userContext);

    return res.json({
      success: true,
      data: aiResponse // { reply, suggestedCareers, roadmapAction, generateRoadmapFor }
    });

  } catch (error) {
    console.error('[aiController] handleChat error:', error.message || error);
    if (error.isRateLimit) {
      return res.status(429).json({ success: false, message: error.message });
    }
    // Return the actual error message for debugging — clients should handle gracefully
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process AI chat'
    });
  }
};

export const handleGenerateCustomRoadmap = async (req, res) => {
  try {
    const { careerName } = req.body;
    if (!careerName || typeof careerName !== 'string') {
      return res.status(400).json({ success: false, message: 'careerName is required' });
    }

    const roadmap = await generateCustomRoadmap(careerName.trim());

    if (!roadmap || !roadmap.title || !Array.isArray(roadmap.stages)) {
      return res.status(500).json({ success: false, message: 'AI returned an invalid roadmap structure' });
    }

    return res.json({ success: true, data: roadmap });

  } catch (error) {
    console.error('[aiController] handleGenerateCustomRoadmap error:', error);
    if (error.isRateLimit) {
      return res.status(429).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Failed to generate custom roadmap' });
  }
};
