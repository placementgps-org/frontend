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
      console.error('[resumeAnalysisService] Gemini API Error:', errText);
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
 * Perform comprehensive AI resume analysis using Gemini 3.5 Flash Lite
 * @param {string} resumeText - Extracted plain text from resume
 * @param {object} userContext - Context from student's profile and roadmap progress
 * @returns {Promise<object>} Structured resume analysis
 */
export const analyzeResumeWithAI = async (resumeText, userContext = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const promptText = `
You are the Chief Technical Placement Officer and Senior ATS Architect at Placement GPS.
Analyze the following student resume thoroughly, objectively, and construct a detailed evaluation.

Context about the student:
${userContext.targetCareer ? `Student is currently preparing for: "${userContext.targetCareer}"` : 'Student has not selected a target career yet.'}
Student Name: ${userContext.name || 'Student'}

RESUME TEXT:
"""
${resumeText}
"""

ANALYSIS GUIDELINES:
1. OVERALL SCORE (0-100): Calculated from structure, depth of skills, project proof, achievements, and formatting.
2. ATS SCORE (0-100): Check standard section headers, readability, keyword density, contact info, lack of confusing tables/columns, standard fonts.
3. SKILLS ANALYSIS:
   - Identify all detected skills.
   - Identify strong skills (backed by real projects/experience).
   - Identify weak or unsubstantiated skills (listed in skills section but not seen in projects or work).
   - Identify missing critical skills for their likely target roles.
   - Identify employability boosters (high-leverage skills that make them hireable).
4. PROJECTS ANALYSIS:
   - Count actual projects.
   - Evaluate technical depth, technologies used, whether measurable achievements (metrics, %, performance) are mentioned.
   - CRITICAL: If the candidate is from Computer Science/IT or seeking tech roles and has 0 projects, give low project score (<40) and explicitly emphasize that adding 2-3 practical projects is mandatory.
5. SUITABLE ROLES:
   - Suggest 3 to 5 realistic roles the student can target (e.g. Python Developer, Full Stack Developer, Frontend Developer, Data Analyst, QA Engineer, Business Analyst, etc.).
   - Calculate match percentage (0-100) and explain why, along with missing skills needed to get hired.
6. INTERNSHIP READINESS:
   - Assess whether they are ready for internships (High, Moderate, Needs Preparation).
   - Suggest 2-4 specific internship domains and prerequisite skills to build first.
7. THINGS TO IMPROVE:
   - Provide concrete, non-generic actionable improvements for:
     * resumeContent (e.g. use action verbs, quantify impact)
     * technicalProfile (specific frameworks/tools to learn)
     * projects (ideas, live links, GitHub repos)
     * atsOptimization (standard headers, keyword placement)
     * careerReadiness (mock interviews, DSA, certification)

Return strictly valid JSON matching this schema:
{
  "overallScore": number,
  "atsScore": number,
  "skillsScore": number,
  "projectsScore": number,
  "overallImpression": "string (2-3 sentences)",
  "strengths": ["string"],
  "atsCompatibility": {
    "score": number,
    "goodPractices": ["string"],
    "potentialIssues": ["string"],
    "improvements": ["string"]
  },
  "skillsAnalysis": {
    "score": number,
    "detected": ["string"],
    "strong": ["string"],
    "weakOrInsufficient": ["string"],
    "missingForTargetRoles": ["string"],
    "employabilityBoosters": ["string"],
    "explanation": "string"
  },
  "projectsAnalysis": {
    "score": number,
    "projectCount": number,
    "hasProjects": boolean,
    "detectedProjects": [
      {
        "name": "string",
        "technologies": ["string"],
        "feedback": "string",
        "strengths": ["string"],
        "missingElements": ["string"]
      }
    ],
    "technicalDepthFeedback": "string",
    "measurableOutcomesFeedback": "string",
    "explanation": "string"
  },
  "profileEvaluation": {
    "education": {
      "degree": "string",
      "relevance": "string",
      "feedback": "string"
    },
    "certifications": {
      "detected": ["string"],
      "relevance": "string",
      "missingRecommendations": ["string"]
    },
    "experience": {
      "internships": ["string"],
      "workExperience": ["string"],
      "qualityFeedback": "string"
    }
  },
  "suitableRoles": [
    {
      "role": "string",
      "matchPercentage": number,
      "reason": "string",
      "missingSkills": ["string"],
      "priority": "string"
    }
  ],
  "internshipReadiness": {
    "isReady": boolean,
    "readinessLevel": "string",
    "suitableDomains": ["string"],
    "recommendedInternshipTypes": ["string"],
    "prerequisiteSkillsToBuild": ["string"],
    "summary": "string"
  },
  "thingsToImprove": {
    "resumeContent": ["string"],
    "technicalProfile": ["string"],
    "projects": ["string"],
    "atsOptimization": ["string"],
    "careerReadiness": ["string"]
  }
}
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      overallScore: { type: 'INTEGER' },
      atsScore: { type: 'INTEGER' },
      skillsScore: { type: 'INTEGER' },
      projectsScore: { type: 'INTEGER' },
      overallImpression: { type: 'STRING' },
      strengths: { type: 'ARRAY', items: { type: 'STRING' } },
      atsCompatibility: {
        type: 'OBJECT',
        properties: {
          score: { type: 'INTEGER' },
          goodPractices: { type: 'ARRAY', items: { type: 'STRING' } },
          potentialIssues: { type: 'ARRAY', items: { type: 'STRING' } },
          improvements: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['score', 'goodPractices', 'potentialIssues', 'improvements']
      },
      skillsAnalysis: {
        type: 'OBJECT',
        properties: {
          score: { type: 'INTEGER' },
          detected: { type: 'ARRAY', items: { type: 'STRING' } },
          strong: { type: 'ARRAY', items: { type: 'STRING' } },
          weakOrInsufficient: { type: 'ARRAY', items: { type: 'STRING' } },
          missingForTargetRoles: { type: 'ARRAY', items: { type: 'STRING' } },
          employabilityBoosters: { type: 'ARRAY', items: { type: 'STRING' } },
          explanation: { type: 'STRING' }
        },
        required: ['score', 'detected', 'strong', 'weakOrInsufficient', 'missingForTargetRoles', 'employabilityBoosters', 'explanation']
      },
      projectsAnalysis: {
        type: 'OBJECT',
        properties: {
          score: { type: 'INTEGER' },
          projectCount: { type: 'INTEGER' },
          hasProjects: { type: 'BOOLEAN' },
          detectedProjects: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                name: { type: 'STRING' },
                technologies: { type: 'ARRAY', items: { type: 'STRING' } },
                feedback: { type: 'STRING' },
                strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                missingElements: { type: 'ARRAY', items: { type: 'STRING' } }
              },
              required: ['name', 'technologies', 'feedback']
            }
          },
          technicalDepthFeedback: { type: 'STRING' },
          measurableOutcomesFeedback: { type: 'STRING' },
          explanation: { type: 'STRING' }
        },
        required: ['score', 'projectCount', 'hasProjects', 'detectedProjects', 'technicalDepthFeedback', 'measurableOutcomesFeedback', 'explanation']
      },
      profileEvaluation: {
        type: 'OBJECT',
        properties: {
          education: {
            type: 'OBJECT',
            properties: {
              degree: { type: 'STRING' },
              relevance: { type: 'STRING' },
              feedback: { type: 'STRING' }
            },
            required: ['degree', 'feedback']
          },
          certifications: {
            type: 'OBJECT',
            properties: {
              detected: { type: 'ARRAY', items: { type: 'STRING' } },
              relevance: { type: 'STRING' },
              missingRecommendations: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['detected', 'missingRecommendations']
          },
          experience: {
            type: 'OBJECT',
            properties: {
              internships: { type: 'ARRAY', items: { type: 'STRING' } },
              workExperience: { type: 'ARRAY', items: { type: 'STRING' } },
              qualityFeedback: { type: 'STRING' }
            },
            required: ['internships', 'workExperience', 'qualityFeedback']
          }
        },
        required: ['education', 'certifications', 'experience']
      },
      suitableRoles: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            role: { type: 'STRING' },
            matchPercentage: { type: 'INTEGER' },
            reason: { type: 'STRING' },
            missingSkills: { type: 'ARRAY', items: { type: 'STRING' } },
            priority: { type: 'STRING' }
          },
          required: ['role', 'matchPercentage', 'reason', 'missingSkills']
        }
      },
      internshipReadiness: {
        type: 'OBJECT',
        properties: {
          isReady: { type: 'BOOLEAN' },
          readinessLevel: { type: 'STRING' },
          suitableDomains: { type: 'ARRAY', items: { type: 'STRING' } },
          recommendedInternshipTypes: { type: 'ARRAY', items: { type: 'STRING' } },
          prerequisiteSkillsToBuild: { type: 'ARRAY', items: { type: 'STRING' } },
          summary: { type: 'STRING' }
        },
        required: ['isReady', 'readinessLevel', 'suitableDomains', 'recommendedInternshipTypes', 'prerequisiteSkillsToBuild', 'summary']
      },
      thingsToImprove: {
        type: 'OBJECT',
        properties: {
          resumeContent: { type: 'ARRAY', items: { type: 'STRING' } },
          technicalProfile: { type: 'ARRAY', items: { type: 'STRING' } },
          projects: { type: 'ARRAY', items: { type: 'STRING' } },
          atsOptimization: { type: 'ARRAY', items: { type: 'STRING' } },
          careerReadiness: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['resumeContent', 'technicalProfile', 'projects', 'atsOptimization', 'careerReadiness']
      }
    },
    required: [
      'overallScore',
      'atsScore',
      'skillsScore',
      'projectsScore',
      'overallImpression',
      'strengths',
      'atsCompatibility',
      'skillsAnalysis',
      'projectsAnalysis',
      'profileEvaluation',
      'suitableRoles',
      'internshipReadiness',
      'thingsToImprove'
    ]
  };

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  try {
    const rawJson = await callGeminiWithRetry(url, requestBody);
    const parsed = JSON.parse(rawJson);
    return parsed;
  } catch (error) {
    console.error('[resumeAnalysisService] AI evaluation error:', error);
    // Return fallback rule-based evaluation if AI is down/rate-limited
    return generateFallbackResumeAnalysis(resumeText, userContext);
  }
};

/**
 * Match and curate relevant Free Courses from the MongoDB collection (141 courses)
 * based on missing skills, recommended roles, and improvement areas.
 */
export const matchFreeCoursesForResume = async (aiAnalysis, targetCareer = '') => {
  try {
    const missingSkills = aiAnalysis?.skillsAnalysis?.missingForTargetRoles || [];
    const boosterSkills = aiAnalysis?.skillsAnalysis?.employabilityBoosters || [];
    const topRoles = (aiAnalysis?.suitableRoles || []).map(r => r.role);

    if (targetCareer) topRoles.unshift(targetCareer);

    // Build search keywords
    const searchKeywords = new Set();
    missingSkills.forEach(s => searchKeywords.add(s.toLowerCase()));
    boosterSkills.forEach(s => searchKeywords.add(s.toLowerCase()));
    topRoles.forEach(r => searchKeywords.add(r.toLowerCase()));

    // Create keyword regex list
    const regexList = Array.from(searchKeywords)
      .filter(k => k.length > 2)
      .slice(0, 15)
      .map(k => new RegExp(k.replace(/[^\w\s]/g, ''), 'i'));

    const roleSlugs = topRoles.map(r => r.toLowerCase().replace(/\s+/g, '-'));

    // Retrieve candidate courses from MongoDB
    const candidateCourses = await Course.find({
      $or: [
        { roles: { $in: roleSlugs } },
        { roles: { $in: topRoles } },
        { courseName: { $in: regexList } },
        { skillsArray: { $in: regexList } },
        { category: { $in: regexList } },
        { department: { $in: regexList } }
      ],
      active: true
    }).lean();

    // Map and score courses into High, Recommended, and Optional priorities
    const prioritizedCourses = [];
    const seenCourseIds = new Set();

    for (const course of candidateCourses) {
      if (seenCourseIds.has(course.courseId)) continue;
      seenCourseIds.add(course.courseId);

      const courseNameLower = (course.courseName || '').toLowerCase();
      const courseSkills = (course.skillsArray || []).map(s => s.toLowerCase());
      const courseRoles = (course.roles || []).map(r => r.toLowerCase());

      let priority = 'optional';
      let reason = `Enhances your profile with foundational ${course.courseName} concepts.`;
      let relatedRole = topRoles[0] || 'General Engineering';
      let relatedSkills = course.skillsArray || [];

      // Check if course matches missing skills (HIGH PRIORITY)
      const missingMatch = missingSkills.find(ms =>
        courseNameLower.includes(ms.toLowerCase()) ||
        courseSkills.some(cs => cs.includes(ms.toLowerCase()))
      );

      // Check if course matches top recommended role (HIGH PRIORITY)
      const topRoleMatch = topRoles.slice(0, 2).find(tr =>
        courseRoles.includes(tr.toLowerCase().replace(/\s+/g, '-')) ||
        courseRoles.includes(tr.toLowerCase())
      );

      if (missingMatch) {
        priority = 'high';
        reason = `Recommended because ${missingMatch} was identified as a missing skill for your target profile.`;
      } else if (topRoleMatch) {
        priority = 'high';
        reason = `Directly strengthens your eligibility for the ${topRoleMatch} role.`;
        relatedRole = topRoleMatch;
      } else if (boosterSkills.some(bs => courseNameLower.includes(bs.toLowerCase()))) {
        priority = 'recommended';
        reason = `Provides a key employability booster skill identified in your resume analysis.`;
      } else {
        priority = 'optional';
        reason = `Expands your foundational domain knowledge in ${course.category || 'technology'}.`;
      }

      prioritizedCourses.push({
        courseId: course.courseId,
        courseName: course.courseName,
        provider: course.provider,
        courseLink: course.courseLink,
        difficulty: course.difficulty || 'All Levels',
        category: course.category || '',
        priority,
        reason,
        relatedRole,
        relatedSkills
      });
    }

    // Ensure we have balanced recommendations across High, Recommended, and Optional
    const high = prioritizedCourses.filter(c => c.priority === 'high').slice(0, 4);
    const recommended = prioritizedCourses.filter(c => c.priority === 'recommended').slice(0, 3);
    const optional = prioritizedCourses.filter(c => c.priority === 'optional').slice(0, 3);

    // If high is empty, promote some recommended
    let finalSelection = [...high, ...recommended, ...optional];
    if (finalSelection.length < 3) {
      const fallbackCourses = await Course.find({ active: true }).limit(6).lean();
      for (const fc of fallbackCourses) {
        if (!seenCourseIds.has(fc.courseId)) {
          finalSelection.push({
            courseId: fc.courseId,
            courseName: fc.courseName,
            provider: fc.provider,
            courseLink: fc.courseLink,
            difficulty: fc.difficulty || 'All Levels',
            category: fc.category || '',
            priority: 'recommended',
            reason: `Broadens your technical competencies.`,
            relatedRole: topRoles[0] || 'Software Engineer',
            relatedSkills: fc.skillsArray || []
          });
        }
      }
    }

    return finalSelection.slice(0, 9);
  } catch (error) {
    console.error('[resumeAnalysisService] matchFreeCoursesForResume error:', error);
    return [];
  }
};

/**
 * Fallback heuristic resume analysis if Gemini is unavailable
 */
function generateFallbackResumeAnalysis(resumeText, userContext = {}) {
  const textLower = resumeText.toLowerCase();

  // Basic skill keyword detector
  const techSkillKeywords = [
    'javascript', 'python', 'java', 'c++', 'c#', 'html', 'css', 'react', 'node.js', 'express',
    'mongodb', 'sql', 'postgresql', 'git', 'github', 'docker', 'aws', 'linux', 'tailwind',
    'django', 'flask', 'spring boot', 'machine learning', 'data analysis', 'pandas', 'numpy'
  ];

  const detected = techSkillKeywords.filter(k => textLower.includes(k));
  const hasProjects = textLower.includes('project') || textLower.includes('github.com') || textLower.includes('developed');
  const hasExperience = textLower.includes('intern') || textLower.includes('experience') || textLower.includes('work');
  const hasCertifications = textLower.includes('certified') || textLower.includes('certificate') || textLower.includes('course');

  const skillsScore = Math.min(Math.max(detected.length * 8 + 40, 50), 88);
  const projectsScore = hasProjects ? 75 : 35;
  const atsScore = 78;
  const overallScore = Math.round((skillsScore * 0.35) + (projectsScore * 0.35) + (atsScore * 0.3));

  return {
    overallScore,
    atsScore,
    skillsScore,
    projectsScore,
    overallImpression: `Your resume demonstrates foundational knowledge with skills in ${detected.slice(0, 3).join(', ') || 'software development'}. Adding more demonstrated projects with measurable achievements will significantly increase your interview shortlist rate.`,
    strengths: [
      `Detected core skills: ${detected.slice(0, 5).join(', ') || 'General Engineering'}`,
      'Clean presentation of academic qualifications',
      hasProjects ? 'Included practical technical projects' : 'Clear contact and background details'
    ],
    atsCompatibility: {
      score: atsScore,
      goodPractices: ['Standard typography and text structure', 'Contact information clearly visible'],
      potentialIssues: ['Ensure section headings use standard terms (Skills, Projects, Education, Experience)'],
      improvements: ['Incorporate more industry-standard role keywords', 'Add quantifiable metrics to project bullet points']
    },
    skillsAnalysis: {
      score: skillsScore,
      detected,
      strong: detected.slice(0, 3),
      weakOrInsufficient: detected.slice(3, 6),
      missingForTargetRoles: ['REST APIs', 'System Design', 'Unit Testing', 'CI/CD Pipelines'],
      employabilityBoosters: ['Docker', 'AWS / Cloud Deployment', 'TypeScript', 'Agile Methodologies'],
      explanation: `Identified ${detected.length} technical skills. Demonstrating these across real-world projects will validate your competence to recruiters.`
    },
    projectsAnalysis: {
      score: projectsScore,
      projectCount: hasProjects ? 2 : 0,
      hasProjects,
      detectedProjects: hasProjects ? [
        {
          name: 'Practical Technical Project',
          technologies: detected.slice(0, 3),
          feedback: 'Project demonstrates core language skills. Add GitHub repo and live deployment links.',
          strengths: ['Application of core skills'],
          missingElements: ['Quantifiable metrics', 'Live demo link']
        }
      ] : [],
      technicalDepthFeedback: hasProjects ? 'Adequate foundational complexity.' : 'No distinct technical projects detected.',
      measurableOutcomesFeedback: 'Quantify your impact (e.g. reduced load time by 30%, handled 500+ daily queries).',
      explanation: hasProjects
        ? 'Projects are listed. Focus on describing architecture, challenges solved, and quantitative outcomes.'
        : 'Your resume does not clearly demonstrate practical projects. For tech roles, 2-3 completed projects are essential.'
    },
    profileEvaluation: {
      education: {
        degree: textLower.includes('bachelor') || textLower.includes('b.tech') || textLower.includes('b.e') ? 'Bachelor of Engineering / Technology' : 'Degree in Progress',
        relevance: 'Highly relevant for engineering and IT placements',
        feedback: 'Mention GPA / Percentage and relevant coursework.'
      },
      certifications: {
        detected: hasCertifications ? ['Technical Coursework / Certification'] : [],
        relevance: 'Strengthens technical credibility',
        missingRecommendations: ['Cloud fundamentals (AWS/GCP)', 'Domain-specific certifications']
      },
      experience: {
        internships: hasExperience ? ['Internship Experience Listed'] : [],
        workExperience: [],
        qualityFeedback: hasExperience ? 'Describe your contributions and business outcomes.' : 'Highlight academic leadership and open-source contributions.'
      }
    },
    suitableRoles: [
      {
        role: userContext.targetCareer || (detected.includes('python') ? 'Python Developer' : 'Full Stack Developer'),
        matchPercentage: Math.max(skillsScore - 5, 65),
        reason: `Solid base in ${detected.slice(0, 3).join(', ') || 'programming'}.`,
        missingSkills: ['REST APIs', 'Cloud Hosting', 'Testing'],
        priority: 'High'
      },
      {
        role: 'Software Engineer',
        matchPercentage: 72,
        reason: 'Broad fundamental problem solving and programming skills.',
        missingSkills: ['Data Structures & Algorithms', 'System Architecture'],
        priority: 'High'
      },
      {
        role: 'QA / Test Automation Engineer',
        matchPercentage: 70,
        reason: 'Good match for software verification and test lifecycle.',
        missingSkills: ['Selenium / Cypress', 'API Testing (Postman)'],
        priority: 'Moderate'
      }
    ],
    internshipReadiness: {
      isReady: hasProjects,
      readinessLevel: hasProjects ? 'Moderate' : 'Needs Preparation',
      suitableDomains: ['Web Development', 'Backend Engineering', 'Software Testing'],
      recommendedInternshipTypes: ['Frontend Intern', 'Junior Backend Intern', 'QA Intern'],
      prerequisiteSkillsToBuild: ['Git / GitHub Collaboration', 'RESTful APIs', 'Database Design'],
      summary: hasProjects
        ? 'You have foundational knowledge for entry-level internships. Polish your project demo links before applying.'
        : 'Build 1-2 end-to-end projects demonstrating your skills before starting internship applications.'
    },
    thingsToImprove: {
      resumeContent: [
        'Use action verbs (Engineered, Architected, Deployed, Streamlined) at the beginning of bullet points.',
        'Add measurable results (e.g. improved speed by 25%, served 100+ users).'
      ],
      technicalProfile: [
        'Learn database indexing and query optimization.',
        'Deepen familiarity with Git and GitHub collaborative workflows.'
      ],
      projects: hasProjects ? [
        'Add live URLs and GitHub repository links for all projects.',
        'Include READMEs detailing project architecture and installation steps.'
      ] : [
        'Build at least 2 full-fledged projects (e.g. CRUD application, REST API).',
        'Deploy them on Vercel/Render and attach live links.'
      ],
      atsOptimization: [
        'Ensure standard headings: Summary, Technical Skills, Projects, Education, Certifications.',
        'Avoid multi-column tables or complex graphical rating bars that confuse ATS scanners.'
      ],
      careerReadiness: [
        'Practice LeetCode / HackerRank problems for placement coding assessments.',
        'Prepare for technical interview questions using the STAR methodology.'
      ]
    }
  };
}
