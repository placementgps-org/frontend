import User from '../models/User.js';
import { getRoadmapTemplate, getCareerMetadata, KNOWN_CAREER_IDS } from '../data/roadmapTemplates.js';

/**
 * Merge a roadmap template with user's saved progress data.
 * Works for both predefined and custom (AI-generated) templates.
 */
const mergeProgressWithTemplate = (template, progress) => {
  const completedTopics = progress.completedTopics || [];
  const inProgressTopics = progress.inProgressTopics || [];

  let totalTopics = 0;
  let completedCount = 0;

  const mergedStages = template.stages.map(stage => {
    const mergedTopics = stage.topics.map(topic => {
      const isProject = topic.hours === 'Project';
      totalTopics++;

      let status = 'NOT_STARTED';
      if (!isProject && completedTopics.includes(topic.id)) {
        status = 'COMPLETED';
        completedCount++;
      } else if (inProgressTopics.includes(topic.id)) {
        status = 'IN_PROGRESS';
      }
      return { ...topic, status };
    });

    return {
      ...stage,
      topics: mergedTopics,
      // Only count non-project completed items for stage progress
      completedCount: mergedTopics.filter(t => t.status === 'COMPLETED').length,
      totalCount: mergedTopics.filter(t => t.hours !== 'Project').length,
    };
  });

  const overallReadiness = totalTopics === 0 ? 0 : Math.round((completedCount / totalTopics) * 100);

  return { mergedStages, totalTopics, completedCount, overallReadiness };
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmap
// Fetch the roadmap template merged with user progress
// ─────────────────────────────────────────────────────────────────────────────
export const getRoadmap = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const progress = user.roadmapProgress || {};

    if (!progress.targetCareerId) {
      return res.json({ success: true, hasCareer: false });
    }

    const careerId = progress.targetCareerId;

    // Check for predefined template first
    let template = getRoadmapTemplate(careerId);

    // Fall back to custom (AI-generated) roadmap
    if (!template) {
      const customRoadmaps = user.customRoadmaps || {};
      const custom = customRoadmaps[careerId];
      if (custom) {
        template = custom;
      }
    }

    // Still not found
    if (!template) {
      return res.json({
        success: true,
        hasCareer: true,
        unknownCareer: true,
        targetCareerId: careerId,
        message: `No roadmap found for "${careerId}". This may be a custom career that was not saved.`
      });
    }

    const { mergedStages, totalTopics, completedCount, overallReadiness } = mergeProgressWithTemplate(template, progress);

    const metadata = getCareerMetadata(careerId);

    res.json({
      success: true,
      hasCareer: true,
      isCustom: !getRoadmapTemplate(careerId),
      targetCareerId: careerId,
      targetCareerName: template.title,
      description: template.description || metadata?.description || '',
      overallReadiness,
      completedCount,
      totalTopics,
      stages: mergedStages,
    });

  } catch (error) {
    console.error('[getRoadmap]', error);
    res.status(500).json({ success: false, message: 'Server error fetching roadmap' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/career
// Select or change the target career
// ─────────────────────────────────────────────────────────────────────────────
export const updateTargetCareer = async (req, res) => {
  try {
    const { careerId } = req.body;
    if (!careerId) return res.status(400).json({ success: false, message: 'careerId is required' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const existingProgress = user.roadmapProgress || {};

    // Archive old progress before switching (keyed by old careerId)
    let careerHistories = user.careerHistories || {};
    if (existingProgress.targetCareerId && existingProgress.targetCareerId !== careerId) {
      careerHistories[existingProgress.targetCareerId] = {
        completedTopics: existingProgress.completedTopics || [],
        inProgressTopics: existingProgress.inProgressTopics || [],
      };
    }

    // Restore progress if they've worked on this career before
    const restored = careerHistories[careerId] || {};

    user.roadmapProgress = {
      targetCareerId: careerId,
      completedTopics: restored.completedTopics || [],
      inProgressTopics: restored.inProgressTopics || [],
    };
    user.careerHistories = careerHistories;
    user.markModified('roadmapProgress');
    user.markModified('careerHistories');
    await user.save();

    res.json({ success: true, message: 'Target career updated' });
  } catch (error) {
    console.error('[updateTargetCareer]', error);
    res.status(500).json({ success: false, message: 'Server error updating career' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/topic
// Update topic status (NOT_STARTED, IN_PROGRESS, COMPLETED)
// ─────────────────────────────────────────────────────────────────────────────
export const updateTopicProgress = async (req, res) => {
  try {
    const { topicId, status } = req.body;
    if (!topicId || !status) {
      return res.status(400).json({ success: false, message: 'topicId and status are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let progress = user.roadmapProgress || {};
    let completed = [...(progress.completedTopics || [])];
    let inProgress = [...(progress.inProgressTopics || [])];

    // Clean both lists
    completed = completed.filter(id => id !== topicId);
    inProgress = inProgress.filter(id => id !== topicId);

    if (status === 'COMPLETED') completed.push(topicId);
    else if (status === 'IN_PROGRESS') inProgress.push(topicId);

    user.roadmapProgress = { ...progress, completedTopics: completed, inProgressTopics: inProgress };
    user.markModified('roadmapProgress');
    await user.save();

    res.json({ success: true, message: 'Topic progress updated' });
  } catch (error) {
    console.error('[updateTopicProgress]', error);
    res.status(500).json({ success: false, message: 'Server error updating topic' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/custom
// Save an AI-generated custom career roadmap
// ─────────────────────────────────────────────────────────────────────────────
export const saveCustomRoadmap = async (req, res) => {
  try {
    const { careerId, roadmap } = req.body;
    if (!careerId || !roadmap) {
      return res.status(400).json({ success: false, message: 'careerId and roadmap are required' });
    }

    // Validate that roadmap has required structure
    if (!roadmap.title || !Array.isArray(roadmap.stages)) {
      return res.status(400).json({ success: false, message: 'Roadmap must have title and stages array' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const customRoadmaps = user.customRoadmaps || {};
    customRoadmaps[careerId] = roadmap;
    user.customRoadmaps = customRoadmaps;
    user.markModified('customRoadmaps');
    await user.save();

    res.json({ success: true, message: 'Custom roadmap saved', careerId });
  } catch (error) {
    console.error('[saveCustomRoadmap]', error);
    res.status(500).json({ success: false, message: 'Server error saving custom roadmap' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmap/recommended-courses
// Recommend free courses matching the user's active roadmap + stage
// ─────────────────────────────────────────────────────────────────────────────
import { getRecommendedCoursesForStage } from '../services/courseMatchingService.js';

export const getRecommendedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const progress = user.roadmapProgress || {};
    if (!progress.targetCareerId) {
      return res.json({ success: true, data: [] });
    }

    const careerId = progress.targetCareerId;
    let template = getRoadmapTemplate(careerId);
    if (!template) {
      const custom = (user.customRoadmaps || {})[careerId];
      if (custom) template = custom;
    }

    if (!template || !template.stages || template.stages.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const completedTopics = progress.completedTopics || [];

    // Optional stage query param if passed, otherwise determine current active stage
    const requestedStageId = req.query.stageId;
    let activeStage = null;
    let activeStageTopics = [];

    if (requestedStageId) {
      activeStage = template.stages.find(s => s.id === requestedStageId);
      if (activeStage) {
        activeStageTopics = activeStage.topics || [];
      }
    }

    if (!activeStage) {
      // Find active stage (first stage with incomplete non-project topics)
      for (const stage of template.stages) {
        const incomplete = (stage.topics || []).filter(t => t.hours !== 'Project' && !completedTopics.includes(t.id));
        if (incomplete.length > 0) {
          activeStage = stage;
          activeStageTopics = incomplete;
          break;
        }
      }
      // If all completed, use the last stage
      if (!activeStage) {
        activeStage = template.stages[template.stages.length - 1];
        activeStageTopics = activeStage.topics || [];
      }
    }

    const recommended = await getRecommendedCoursesForStage({
      careerId,
      careerTitle: template.title,
      stageId: activeStage.id,
      stageTitle: activeStage.title,
      stageTopics: activeStageTopics,
      limit: 6
    });

    res.json({
      success: true,
      data: recommended,
      activeStage: {
        id: activeStage.id,
        title: activeStage.title
      }
    });
  } catch (error) {
    console.error('[getRecommendedCourses]', error);
    res.status(500).json({ success: false, message: 'Server error fetching recommendations', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmap/careers
// Return all known predefined career IDs + titles
// ─────────────────────────────────────────────────────────────────────────────
export const getKnownCareers = async (req, res) => {
  try {
    const careers = KNOWN_CAREER_IDS.map(id => {
      const t = getRoadmapTemplate(id);
      const m = getCareerMetadata(id);
      return { id, title: t?.title || id, description: m?.description || '' };
    });
    res.json({ success: true, data: careers });
  } catch (error) {
    console.error('[getKnownCareers]', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
