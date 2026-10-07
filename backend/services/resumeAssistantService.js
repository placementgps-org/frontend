import dotenv from 'dotenv';
dotenv.config();
import Course from '../models/Course.js';

// ── Shared Gemini Call with exponential retry ──────────────────────────────────
const callGeminiWithRetry = async (url, requestBody, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await globalThis.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.status === 429) {
      let retryAfterMs = Math.pow(2, attempt) * 1000;
      try {
        const errJson = await response.json();
        const retryInfo = errJson?.error?.details?.find(d => d.retryDelay);
        if (retryInfo?.retryDelay) {
          const secs = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
          if (secs > 0 && secs <= 15) retryAfterMs = secs * 1000;
        }
      } catch { /* ignore parse */ }

      if (attempt < maxRetries) {
        console.log(`Gemini rate limited (429). Retrying in ${retryAfterMs / 1000}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryAfterMs));
        continue;
      }
      const err = new Error('AI service is temporarily rate limited. Please try again in a moment.');
      err.isRateLimit = true;
      throw err;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[resumeAssistantService] Gemini API Error:', errText);
      throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error('AI returned empty response');

    generatedText = generatedText.trim();
    if (generatedText.startsWith('```')) {
      generatedText = generatedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }

    return generatedText;
  }
};

/**
 * Handle AI Career Assistant message and Course Evaluation
 * @param {object} params
 * @param {object} params.resume - User's Resume document with analysis
 * @param {object} params.userContext - User details (name, target career, etc.)
 * @param {string} params.message - Current user query / question
 * @param {Array} params.conversationHistory - Prior messages [{ role: 'user'|'assistant', content: string }]
 * @param {string} [params.courseId] - Optional courseId if asking to evaluate a specific course
 * @param {string} [params.courseName] - Optional courseName
 */
export const processCareerAssistantQuery = async ({
  resume,
  userContext = {},
  message = '',
  conversationHistory = [],
  courseId = '',
  courseName = ''
}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }

  // 1. Resolve course details if evaluating a course
  let targetCourse = null;
  if (courseId) {
    targetCourse = await Course.findOne({ courseId, active: true }).lean();
  }
  if (!targetCourse && courseName) {
    targetCourse = await Course.findOne({
      courseName: new RegExp(courseName.replace(/[^\w\s]/g, ''), 'i'),
      active: true
    }).lean();
  }

  // If not explicitly provided, check if the student's message mentions a course from our catalog
  if (!targetCourse && message) {
    const isEvaluationIntent =
      message.toLowerCase().includes('course') ||
      message.toLowerCase().includes('evaluate') ||
      message.toLowerCase().includes('suitable') ||
      message.toLowerCase().includes('good for me');

    if (isEvaluationIntent) {
      // Find candidate matching course
      const courses = await Course.find({ active: true }).select('courseId courseName provider difficulty category skillsArray courseLink').lean();
      for (const c of courses) {
        if (message.toLowerCase().includes(c.courseName.toLowerCase())) {
          targetCourse = c;
          break;
        }
      }
    }
  }

  // 2. Build concise student context
  const analysis = resume?.analysis || {};
  const skillsDetected = analysis.skillsAnalysis?.detected || [];
  const strongSkills = analysis.skillsAnalysis?.strong || [];
  const weakSkills = analysis.skillsAnalysis?.weakOrInsufficient || [];
  const missingSkills = analysis.skillsAnalysis?.missingForTargetRoles || [];
  const suitableRoles = (analysis.suitableRoles || []).map(r => `${r.role} (${r.matchPercentage}% match)`).join(', ');
  const projectsSummary = (analysis.projectsAnalysis?.detectedProjects || []).map(p => `${p.name} [${p.technologies?.join(', ')}]`).join('; ') || 'No projects listed';
  const overallScore = analysis.overallScore || 0;
  const atsScore = analysis.atsScore || 0;
  const targetCareer = userContext.targetCareer || (analysis.suitableRoles?.[0]?.role) || 'Software Engineering';

  // 3. Format prior conversation history for context (last 6 messages max)
  const recentHistory = conversationHistory.slice(-6).map(m => `${m.role === 'user' ? 'Student' : 'AI Assistant'}: ${m.content}`).join('\n');

  // 4. Construct prompt
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  let prompt = `
You are the Chief AI Career Mentor and Technical Placement Officer at Placement GPS.
Your mission is to guide students on their resume, skill development, career path, and free courses.
You MUST be objective, supportive, and specifically grounded in the student's actual profile and demonstrated skills.

STUDENT PROFILE CONTEXT:
- Name: ${userContext.name || 'Student'}
- Target / Best Matched Career: ${targetCareer}
- Overall Placement Score: ${overallScore}/100 | ATS Score: ${atsScore}/100
- Detected Skills: ${skillsDetected.join(', ') || 'None listed'}
- Strong Demonstrated Skills: ${strongSkills.join(', ') || 'None validated'}
- Skills Needing Project Evidence: ${weakSkills.join(', ') || 'None'}
- Missing Skills for Target Roles: ${missingSkills.join(', ') || 'None'}
- Recommended Roles: ${suitableRoles || 'General Engineering'}
- Practical Projects: ${projectsSummary}
- Internship Readiness: ${analysis.internshipReadiness?.readinessLevel || 'Moderate'}
- Extracted Resume Summary: """${(resume?.extractedText || '').slice(0, 1500)}"""

${recentHistory ? `RECENT CONVERSATION HISTORY:\n${recentHistory}\n` : ''}

CURRENT STUDENT INQUIRY:
"${message || (targetCourse ? `Please evaluate if "${targetCourse.courseName}" is suitable for me.` : 'How can I improve my placement readiness?')}"
`;

  if (targetCourse) {
    prompt += `
COURSE TO EVALUATE:
- Course Name: ${targetCourse.courseName}
- Platform / Provider: ${targetCourse.provider}
- Difficulty Level: ${targetCourse.difficulty || 'All Levels'}
- Category / Domain: ${targetCourse.category || 'General'}
- Covered Skills: ${(targetCourse.skillsArray || []).join(', ') || 'N/A'}
- URL: ${targetCourse.courseLink}

INSTRUCTIONS FOR COURSE EVALUATION:
Evaluate this course specifically for THIS student.
1. Relevance % (0-100): How closely it relates to their target roles and current skill gaps.
2. Course Level vs Student Demonstrated Level: Compare the course difficulty against the student's verified experience on their resume.
3. Suitability: Classify as one of:
   - "Highly Recommended" (Essential for target career or bridges a key missing skill)
   - "Recommended" (Valuable addition that strengthens profile)
   - "Useful but Optional" (Good for broader knowledge, but not urgent)
   - "Too Basic" (Student already has demonstrated skills / projects in this topic)
   - "Too Advanced / Not Yet" (Student lacks foundational prerequisites)
   - "Not Relevant" (Does not align with student's career direction or skills)
4. Reason: Direct, personalized explanation citing their resume/projects.
5. Skills Gained: List 2-4 key skills they would acquire.
6. Resume Value: Explain how it enhances their hiring probability.
7. Better Alternative / Next Step: Suggest what they should learn or do next (recommend another topic or specific course if too basic/advanced/irrelevant).
`;
  } else {
    prompt += `
INSTRUCTIONS FOR GENERAL CAREER / RESUME INQUIRY:
- Give a direct, practical, and highly personalized answer tailored to their resume, skills, scores, and target roles.
- Use clean markdown with short paragraphs, bold terms, and bullet points.
- If they ask about learning next steps, suggest actionable skills and project ideas that address their specific missing skills (${missingSkills.join(', ') || 'System Design, REST APIs, Git'}).
- If they ask about ATS scores, explain how to optimize bullet points, quantifiable metrics, and keywords based on their current score (${atsScore}/100).
- If they ask something unrelated to placement/careers, politely guide them back to their career development.
`;
  }

  prompt += `
Return strictly valid JSON matching this schema:
{
  "isCourseEvaluation": boolean,
  "courseEvaluation": {
    "courseName": "string",
    "provider": "string",
    "courseLink": "string",
    "relevancePercentage": number,
    "courseLevel": "string",
    "studentLevel": "string",
    "suitability": "string (Highly Recommended | Recommended | Useful but Optional | Too Basic | Too Advanced / Not Yet | Not Relevant)",
    "suitabilityBadgeColor": "string (emerald | blue | amber | orange | red)",
    "reason": "string",
    "skillsGained": ["string"],
    "resumeValue": "string",
    "betterAlternative": "string"
  },
  "message": "string (Full markdown formatted response with friendly explanation, bullets, and advice)"
}
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      isCourseEvaluation: { type: 'BOOLEAN' },
      courseEvaluation: {
        type: 'OBJECT',
        properties: {
          courseName: { type: 'STRING' },
          provider: { type: 'STRING' },
          courseLink: { type: 'STRING' },
          relevancePercentage: { type: 'INTEGER' },
          courseLevel: { type: 'STRING' },
          studentLevel: { type: 'STRING' },
          suitability: { type: 'STRING' },
          suitabilityBadgeColor: { type: 'STRING' },
          reason: { type: 'STRING' },
          skillsGained: { type: 'ARRAY', items: { type: 'STRING' } },
          resumeValue: { type: 'STRING' },
          betterAlternative: { type: 'STRING' }
        },
        required: [
          'courseName',
          'relevancePercentage',
          'courseLevel',
          'studentLevel',
          'suitability',
          'reason',
          'skillsGained',
          'resumeValue'
        ]
      },
      message: { type: 'STRING' }
    },
    required: ['isCourseEvaluation', 'message']
  };

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  try {
    const rawJson = await callGeminiWithRetry(url, requestBody);
    const parsed = JSON.parse(rawJson);

    // If it was a course evaluation, ensure course metadata is attached
    if (parsed.isCourseEvaluation && parsed.courseEvaluation) {
      if (targetCourse) {
        parsed.courseEvaluation.courseLink = targetCourse.courseLink || parsed.courseEvaluation.courseLink || '';
        parsed.courseEvaluation.provider = targetCourse.provider || parsed.courseEvaluation.provider || '';
        parsed.courseEvaluation.courseName = targetCourse.courseName || parsed.courseEvaluation.courseName || '';
      }
      if (!parsed.courseEvaluation.suitabilityBadgeColor) {
        const s = (parsed.courseEvaluation.suitability || '').toLowerCase();
        if (s.includes('high')) parsed.courseEvaluation.suitabilityBadgeColor = 'emerald';
        else if (s.includes('too basic')) parsed.courseEvaluation.suitabilityBadgeColor = 'amber';
        else if (s.includes('too advanced') || s.includes('not yet')) parsed.courseEvaluation.suitabilityBadgeColor = 'orange';
        else if (s.includes('not relevant')) parsed.courseEvaluation.suitabilityBadgeColor = 'red';
        else parsed.courseEvaluation.suitabilityBadgeColor = 'blue';
      }
    }

    return parsed;
  } catch (error) {
    console.error('[resumeAssistantService] AI Error:', error);
    return generateFallbackAssistantResponse(message, targetCourse, analysis, userContext);
  }
};

/**
 * Fallback response if AI is temporarily unavailable
 */
function generateFallbackAssistantResponse(message, targetCourse, analysis, userContext) {
  const missingSkills = analysis?.skillsAnalysis?.missingForTargetRoles || ['REST APIs', 'Cloud Hosting', 'Testing'];
  const strongSkills = analysis?.skillsAnalysis?.strong || ['Core Programming', 'Web Fundamentals'];
  const topRole = analysis?.suitableRoles?.[0]?.role || 'Software Developer';

  if (targetCourse) {
    const courseNameLower = targetCourse.courseName.toLowerCase();
    const hasSkill = strongSkills.some(s => courseNameLower.includes(s.toLowerCase()));

    const suitability = hasSkill ? 'Too Basic' : 'Recommended';
    const badgeColor = hasSkill ? 'amber' : 'emerald';
    const relevance = hasSkill ? 70 : 88;

    return {
      isCourseEvaluation: true,
      courseEvaluation: {
        courseName: targetCourse.courseName,
        provider: targetCourse.provider,
        courseLink: targetCourse.courseLink,
        relevancePercentage: relevance,
        courseLevel: targetCourse.difficulty || 'All Levels',
        studentLevel: hasSkill ? 'Intermediate' : 'Beginner',
        suitability,
        suitabilityBadgeColor: badgeColor,
        reason: hasSkill
          ? `You already demonstrate experience in ${targetCourse.courseName} concepts. This course may be too introductory for your profile.`
          : `This course builds upon key skills required for the ${topRole} position.`,
        skillsGained: targetCourse.skillsArray?.slice(0, 3) || ['Practical Implementation', 'Core Fundamentals'],
        resumeValue: `Strengthens your demonstrated skill profile for campus recruitment.`,
        betterAlternative: hasSkill ? `Focus on advanced architecture and project implementations with ${missingSkills.slice(0, 2).join(', ')}.` : ''
      },
      message: `### Course Evaluation: ${targetCourse.courseName}\n\n**Relevance:** ${relevance}% | **Status:** ${suitability}\n\n${hasSkill ? `You already have demonstrated experience in this area. We recommend focusing on building practical projects or learning ${missingSkills.join(', ')} instead.` : `This course is a strong match for your target role of **${topRole}**.`}`
    };
  }

  return {
    isCourseEvaluation: false,
    courseEvaluation: null,
    message: `Based on your resume analysis for **${topRole}**:\n\n- **Strongest Skills:** ${strongSkills.join(', ')}\n- **Top Skills to Learn Next:** ${missingSkills.join(', ')}\n- **Next Recommendation:** Build a practical project incorporating ${missingSkills[0] || 'REST APIs'} and deploy it to a live cloud platform.`
  };
}
