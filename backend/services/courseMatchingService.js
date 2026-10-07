import Course from '../models/Course.js';
import { generateRoleKeywords, scoreCourseRelevance } from './aiService.js';
import { getRoadmapTemplate } from '../data/roadmapTemplates.js';

// ── In-memory cache for recommendations (1 hour TTL) ───────────────────────────
const recommendationCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const getCacheKey = (careerId, stageId) => `${careerId || 'all'}:${stageId || 'all'}`;

/**
 * Domain groupings to prevent cross-contamination
 * (e.g. Cybersecurity courses showing up on Web Dev / Full Stack roadmaps)
 */
const DOMAIN_RULES = {
  cybersecurity: ['cybersecurity-engineer', 'cybersecurity-analyst', 'soc-analyst', 'threat-intelligence-analyst', 'penetration-tester-ethical-hacker', 'penetration-tester'],
  web_software: ['full-stack-developer', 'software-engineer', 'frontend-developer', 'backend-developer', 'web-developer', 'python-developer', 'mobile-developer', 'qa-engineer', 'automation-test-engineer', 'game-developer'],
  data_ai: ['ai-engineer', 'machine-learning', 'machine-learning-engineer', 'data-scientist', 'data-engineer', 'data-analyst', 'generative-ai-engineer', 'nlp-engineer', 'computer-vision-engineer'],
  cloud_devops: ['cloud-architect', 'devops-engineer', 'cloud-engineer', 'cloud-security-engineer', 'systems-administrator', 'network-administrator', 'network-engineer', 'solutions-architect', 'devsecops-engineer'],
  business_finance: ['business-analyst', 'financial-analyst', 'accountant', 'tax-associate', 'auditor', 'finance-operations-associate', 'economics-analyst', 'hr-specialist', 'recruiter', 'hr-operations-executive', 'digital-marketing-specialist', 'seo-specialist', 'social-media-specialist', 'content-marketing-specialist', 'sales-executive', 'business-development-executive', 'customer-success-executive', 'operations-executive', 'management-trainee'],
  design: ['graphic-designer', 'ui-ux-designer', 'product-designer']
};

/**
 * Extract clean keywords from text
 */
function extractKeywords(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'for', 'with', 'the', 'how', 'from', 'into', 'using', 'basics', 'fundamentals'].includes(w));
}

/**
 * Centralized Course Matching Service
 * Combines Deterministic Matching + AI Semantic Ranking + Caching
 */
export const getRecommendedCoursesForStage = async ({
  careerId = '',
  careerTitle = '',
  stageId = '',
  stageTitle = '',
  stageTopics = [],
  limit = 6
}) => {
  const normalizedCareerId = (careerId || '').toLowerCase().trim().replace(/\s+/g, '-');
  const cacheKey = getCacheKey(normalizedCareerId, stageId);

  // 1. Check in-memory cache
  const cached = recommendationCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  // 2. Resolve career metadata if not provided
  let effectiveTitle = careerTitle;
  if (!effectiveTitle && normalizedCareerId) {
    const template = getRoadmapTemplate(normalizedCareerId);
    if (template) effectiveTitle = template.title;
  }
  if (!effectiveTitle) effectiveTitle = normalizedCareerId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // 3. Extract stage keywords and topic titles
  const topicTitles = Array.isArray(stageTopics)
    ? stageTopics.map(t => (typeof t === 'string' ? t : t.title || ''))
    : [];
  
  const searchKeywords = new Set();
  topicTitles.forEach(t => extractKeywords(t).forEach(k => searchKeywords.add(k)));
  if (stageTitle) extractKeywords(stageTitle).forEach(k => searchKeywords.add(k));
  if (effectiveTitle) extractKeywords(effectiveTitle).forEach(k => searchKeywords.add(k));

  const keywordList = Array.from(searchKeywords).filter(k => k.length > 2);
  const keywordRegexes = keywordList.map(k => new RegExp(k, 'i'));

  // 4. Retrieve candidate courses from MongoDB (MUST be active: true)
  const queryConditions = [
    { roles: normalizedCareerId },
    { roles: effectiveTitle }
  ];

  if (stageId) {
    queryConditions.push({ roadmapStages: stageId });
  }

  if (keywordRegexes.length > 0) {
    queryConditions.push(
      { courseName: { $in: keywordRegexes } },
      { skillsArray: { $in: keywordRegexes } },
      { category: { $in: keywordRegexes } },
      { department: { $in: keywordRegexes } }
    );
  }

  let candidates = await Course.find({
    $or: queryConditions,
    active: true
  }).lean();

  // If no candidates found by strict criteria, fallback to role-broad search
  if (candidates.length === 0 && normalizedCareerId) {
    candidates = await Course.find({
      $or: [
        { roles: normalizedCareerId },
        { roles: { $regex: new RegExp(normalizedCareerId.replace(/-/g, '.*'), 'i') } },
        { department: { $regex: new RegExp(effectiveTitle, 'i') } }
      ],
      active: true
    }).lean();
  }

  // If still empty, grab general top courses for that broad department
  if (candidates.length === 0) {
    candidates = await Course.find({ active: true }).limit(20).lean();
  }

  // 5. Domain Relevance Filtering (Prevent Anti-patterns)
  const isCyberRole = DOMAIN_RULES.cybersecurity.includes(normalizedCareerId);
  const isWebRole = DOMAIN_RULES.web_software.includes(normalizedCareerId);
  const isDataRole = DOMAIN_RULES.data_ai.includes(normalizedCareerId);
  const isBusinessRole = DOMAIN_RULES.business_finance.includes(normalizedCareerId);

  const filteredCandidates = candidates.filter(c => {
    const courseNameLower = (c.courseName || '').toLowerCase();
    const skillsLower = (c.skillsArray || []).join(' ').toLowerCase();
    const categoryLower = (c.category || '').toLowerCase();
    const fullText = `${courseNameLower} ${skillsLower} ${categoryLower}`;

    const isCyberCourse = fullText.includes('cybersecurity') || fullText.includes('threat intelligence') || fullText.includes('penetration testing') || fullText.includes('ethical hacker') || fullText.includes('soc analyst');
    const isAccountingCourse = fullText.includes('bookkeeping') || fullText.includes('tally') || fullText.includes('financial accounting') || fullText.includes('auditing');

    if (!isCyberRole && isCyberCourse) return false;
    if (!isBusinessRole && isAccountingCourse && (isWebRole || isDataRole)) return false;

    return true;
  });

  const candidatesToScore = (filteredCandidates.length > 0 ? filteredCandidates : candidates).slice(0, 25);

  // 6. Deterministic Base Scoring
  const scoredCandidates = candidatesToScore.map(course => {
    let score = 65; // Base relevance
    const courseNameLower = (course.courseName || '').toLowerCase();
    const skillsLower = (course.skillsArray || []).join(' ').toLowerCase();
    const courseRoles = (course.roles || []).map(r => r.toLowerCase());

    // Role Match Bonus (+25)
    if (courseRoles.includes(normalizedCareerId) || courseRoles.includes(effectiveTitle.toLowerCase())) {
      score += 25;
    }

    // Stage / Topic Keyword Matches (+5 per match, up to +20)
    let topicMatches = 0;
    for (const kw of keywordList) {
      if (courseNameLower.includes(kw) || skillsLower.includes(kw)) {
        topicMatches++;
      }
    }
    score += Math.min(topicMatches * 5, 20);

    // Stage specific match
    if (stageId && course.roadmapStages && course.roadmapStages.includes(stageId)) {
      score += 10;
    }

    // Clamp score
    const deterministicScore = Math.min(Math.max(score, 60), 98);

    const defaultExplanation = stageTitle
      ? `Ideal for mastering ${stageTitle} in the ${effectiveTitle} path.`
      : `Highly recommended foundational course for ${effectiveTitle}.`;

    return {
      ...course,
      relevanceScore: deterministicScore,
      aiExplanation: defaultExplanation
    };
  });

  // 7. AI Semantic Scoring (Gemini 3.5 Flash Lite) with Graceful Fallback
  let finalEnriched = scoredCandidates;
  try {
    const roleKeywords = await generateRoleKeywords(effectiveTitle);
    const aiScores = await scoreCourseRelevance(scoredCandidates, effectiveTitle, roleKeywords);

    if (Array.isArray(aiScores) && aiScores.length > 0) {
      finalEnriched = scoredCandidates.map(course => {
        const aiMatch = aiScores.find(s => s.courseId === course.courseId);
        if (aiMatch && typeof aiMatch.relevanceScore === 'number' && aiMatch.relevanceScore > 0) {
          const blendedScore = Math.round((aiMatch.relevanceScore * 0.6) + (course.relevanceScore * 0.4));
          return {
            ...course,
            relevanceScore: Math.min(Math.max(blendedScore, 65), 98),
            aiExplanation: aiMatch.explanation || course.aiExplanation
          };
        }
        return course;
      });
    }
  } catch (aiErr) {
    console.warn('[courseMatchingService] AI scoring failed/skipped, using deterministic scores:', aiErr.message);
  }

  // 8. Sort and Format
  const finalRanked = finalEnriched
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map(c => ({
      _id: c._id,
      courseId: c.courseId,
      courseName: c.courseName,
      provider: c.provider,
      courseLink: c.courseLink,
      category: c.category || '',
      department: c.department || '',
      difficulty: c.difficulty || 'All Levels',
      skillsArray: c.skillsArray || [],
      roles: c.roles || [],
      relevanceScore: c.relevanceScore,
      aiExplanation: c.aiExplanation
    }));

  // 9. Store in cache
  recommendationCache.set(cacheKey, {
    timestamp: Date.now(),
    data: finalRanked
  });

  return finalRanked;
};

/**
 * Clear cache helper (useful when catalog is updated)
 */
export const clearRecommendationCache = () => {
  recommendationCache.clear();
};
