import dotenv from 'dotenv';
dotenv.config();
import AptitudeQuestion from '../models/AptitudeQuestion.js';
import CompanyQuestion from '../models/CompanyQuestion.js';

// ── Shared helper: call Gemini with automatic retry on 429 ─────────────────────
const callGeminiWithRetry = async (url, requestBody, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await globalThis.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.status === 429) {
      let retryAfterMs = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s

      try {
        const errJson = await response.json();
        const retryInfo = errJson?.error?.details?.find(d => d.retryDelay);
        if (retryInfo?.retryDelay) {
          const secs = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
          // Only trust their retryDelay if it's reasonable, else fallback to exponential
          if (secs > 0 && secs <= 15) {
             retryAfterMs = secs * 1000;
          }
        }
      } catch { /* ignore parse error */ }

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
      console.error('Gemini API Error:', errText);
      throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error('AI returned empty response');
    
    // Robustly strip markdown fences in case Gemini wraps the JSON
    generatedText = generatedText.trim();
    if (generatedText.startsWith('```')) {
      generatedText = generatedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    }
    
    return generatedText;
  }
};

/**
 * Generate aptitude questions using Gemini REST API with Structured Outputs.
 */
export const generateQuestionsFromAI = async (category, topic, difficulty, count, isCompany = false, company = '', existingQuestions = []) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  // Build the system instructions
  let promptText = `Generate exactly ${count} unique aptitude multiple-choice questions for the category '${category}' and topic '${topic}'. 
The difficulty level should be strictly '${difficulty}'.
`;

  if (isCompany) {
    promptText += `These questions should mimic the style, pattern, and numerical structure typical of ${company} placement assessments.\n`;
  }

  if (existingQuestions && existingQuestions.length > 0) {
    promptText += `\nDO NOT reuse or slightly modify these existing scenarios:
${existingQuestions.slice(0, 15).map(q => `- ${q}`).join('\n')}
\nCreate meaningful variations in numbers, wording, scenarios, and reasoning approach.\n`;
  }

  promptText += `
Each question MUST follow these strict rules:
1. Provide exactly 4 options.
2. Provide exactly 1 correctAnswer that perfectly matches one of the options.
3. Provide a concise 'explanation' string.
4. Provide a 'solutionSteps' array containing brief, step-by-step logic (keep it extremely concise).
5. (Optional) Provide a 'shortcut' string if a time-saving trick exists.
6. Provide the specific 'concept' being tested.
7. Provide 'estimatedTime' in seconds (e.g., 60).
8. Ensure the math is 100% correct and unambiguous.
Do not repeat common textbook examples. Return ONLY valid JSON.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            correctAnswer: { type: 'STRING' },
            explanation: { type: 'STRING' },
            solutionSteps: { type: 'ARRAY', items: { type: 'STRING' } },
            shortcut: { type: 'STRING' },
            concept: { type: 'STRING' },
            estimatedTime: { type: 'INTEGER' }
          },
          required: ['question', 'options', 'correctAnswer', 'explanation', 'solutionSteps', 'concept', 'estimatedTime']
        }
      }
    },
    required: ['questions']
  };

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: promptText }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  try {
    const generatedText = await callGeminiWithRetry(url, requestBody);
    let parsedResponse = {};
    try {
      parsedResponse = JSON.parse(generatedText);
    } catch (e) {
      console.error('Failed to parse AI JSON:', generatedText.substring(0, 100));
      throw new Error('AI generated malformed JSON');
    }
    
    const parsedQuestions = parsedResponse.questions || [];
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error('AI did not return a valid questions array');
    }
    
    // Basic structural validation only. Deduplication is handled by the controller.
    const validQuestions = [];
    for (const q of parsedQuestions) {
      if (
        !q.question || 
        !q.options || q.options.length !== 4 || 
        !q.correctAnswer || 
        !q.options.includes(q.correctAnswer) ||
        !q.solutionSteps || q.solutionSteps.length === 0
      ) {
        continue;
      }

      validQuestions.push({
        ...q,
        solution: q.solutionSteps, // Map back to internal schema field
        category,
        topic,
        difficulty,
        generatedByAI: true,
        active: true,
        sourceType: isCompany ? 'Company-Style AI Question' : 'AI Generated',
        ...(isCompany ? { 
          company, 
          questionType: 'Company-Style AI',
          source: 'AI Generation'
        } : {})
      });
    }

    if (validQuestions.length === 0) {
      throw new Error('AI generated questions failed validation completely.');
    }

    return validQuestions;

  } catch (error) {
    console.error('AI Service Exception:', error.message);
    throw error;
  }
};

/**
 * Generate structured topic notes using Gemini REST API.
 * Returns formulas, keyConcepts, shortcuts, mistakes for the given topic.
 */
export const generateTopicNotesFromAI = async (category, topicName) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const promptText = `Generate comprehensive aptitude study notes for the topic "${topicName}" in the "${category}" category for placement exam preparation.

Provide:
1. "formulas": Array of 4-8 key formulas. Each formula must have "name" (string) and "formula" (string showing the mathematical formula or rule).
2. "keyConcepts": Array of 4-6 strings, each explaining a fundamental concept students must know.
3. "shortcuts": Array of 3-5 strings, each describing a useful trick or shortcut to solve questions faster.
4. "mistakes": Array of 2-4 objects, each with "incorrect" (common mistake description) and "correct" (the right approach).

Keep all content precise, practical, and directly useful for placement exam preparation. Focus on the most tested aspects of "${topicName}".`;

  const schema = {
    type: 'OBJECT',
    properties: {
      formulas: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING' },
            formula: { type: 'STRING' }
          },
          required: ['name', 'formula']
        }
      },
      keyConcepts: { type: 'ARRAY', items: { type: 'STRING' } },
      shortcuts: { type: 'ARRAY', items: { type: 'STRING' } },
      mistakes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            incorrect: { type: 'STRING' },
            correct: { type: 'STRING' }
          },
          required: ['incorrect', 'correct']
        }
      }
    },
    required: ['formulas', 'keyConcepts', 'shortcuts', 'mistakes']
  };

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  const generatedText = await callGeminiWithRetry(url, requestBody);
  try {
    return JSON.parse(generatedText);
  } catch (e) {
    console.error('Failed to parse Notes JSON:', generatedText.substring(0, 100));
    throw new Error('AI generated malformed JSON for notes');
  }
};

/**
 * Career Guidance AI Chat using Gemini.
 * Detects: existing career → roadmapAction slug
 *          unknown/new career → generateRoadmapFor career name
 */
export const chatWithCareerAdvisor = async (messages, userContext) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const systemInstruction = `
You are Placement GPS Career Guide, an elite AI assistant designed to help students discover tech careers and become placement-ready.

PREDEFINED CAREERS AVAILABLE IN THE PLATFORM (use these EXACT IDs):
- software-engineer → Software Engineer
- full-stack-developer → Full Stack Developer
- mobile-developer → Mobile Developer
- ai-engineer → AI Engineer
- machine-learning-engineer → Machine Learning Engineer
- data-scientist → Data Scientist
- data-engineer → Data Engineer
- cloud-architect → Cloud Architect
- devops-engineer → DevOps Engineer
- cybersecurity-engineer → Cybersecurity Engineer
- network-engineer → Network Engineer
- qa-engineer → QA Engineer

YOUR BEHAVIOR:
1. Answer career questions clearly: what the role does, responsibilities, required skills, tools, salary context (India), and placement tips.
2. When a student is interested in one of the PREDEFINED CAREERS above, set "roadmapAction" to its exact ID slug (e.g. "cybersecurity-engineer"). Also explain what they'll learn.
3. When a student asks for a career NOT in the list above (e.g. "Cloud Security Engineer", "Prompt Engineer", "AR Developer"), set "generateRoadmapFor" to the career name and explain that you will generate a custom roadmap for them.
4. When a student says "I don't know what to choose", ask 2-3 smart questions to understand their interests before recommending.
5. Be honest, student-friendly, and use Markdown formatting (bold, bullet lists).
6. Never invent course URLs or fake certificates. Never promise salaries.

User Context: ${userContext || 'First-time user.'}
  `;

  // Gemini requires conversation to start with 'user' role.
  // Filter any leading 'model' messages (e.g. initial AI greeting shown in frontend).
  const allFormatted = messages.map(msg => ({
    role: msg.role === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content || '' }]
  }));

  // Drop leading model turns so Gemini doesn't reject the request
  let startIdx = 0;
  while (startIdx < allFormatted.length && allFormatted[startIdx].role === 'model') {
    startIdx++;
  }
  const formattedContents = allFormatted.slice(startIdx);

  // If nothing left (no user messages at all), throw a clear error
  if (formattedContents.length === 0) {
    throw new Error('No user messages found in conversation history');
  }

  const schema = {
    type: 'OBJECT',
    properties: {
      reply: { type: 'STRING', description: 'Markdown-formatted conversational response.' },
      suggestedCareers: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'Career roles explicitly discussed in this turn.'
      },
      roadmapAction: {
        type: 'STRING',
        description: 'If recommending a PREDEFINED career, the exact careerId slug (e.g. "cybersecurity-engineer"). Leave empty otherwise.'
      },
      generateRoadmapFor: {
        type: 'STRING',
        description: 'If the student wants a career NOT in the predefined list, the human-readable career name. Leave empty otherwise.'
      }
    },
    required: ['reply']
  };

  const requestBody = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: formattedContents,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  const generatedText = await callGeminiWithRetry(url, requestBody);
  try {
    const parsed = JSON.parse(generatedText);
    if (!parsed.reply) {
      console.error('[chatWithCareerAdvisor] AI returned JSON without reply field:', generatedText.substring(0, 200));
      throw new Error('AI response missing reply field');
    }
    return parsed;
  } catch (e) {
    if (e.message === 'AI response missing reply field') throw e;
    console.error('[chatWithCareerAdvisor] Failed to parse JSON:', generatedText.substring(0, 200));
    // Try to salvage a plain-text response if structured output fails
    if (generatedText && generatedText.length > 0) {
      return { reply: generatedText, suggestedCareers: [], roadmapAction: '', generateRoadmapFor: '' };
    }
    throw new Error('AI generated malformed JSON for chat');
  }
};

/**
 * Generate quick, personalized explanations for why a specific course is recommended
 * for the user's current stage and career.
 */
export const explainCourseRecommendations = async (courses, careerName, stageTitle) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const promptText = `
You are the Placement GPS Career AI.
The user is aiming to become a "${careerName}" and is currently at the stage "${stageTitle}".
Below are ${courses.length} candidate free courses that deterministically match their role and stage.
Your task is to SELECT THE TOP 4 MOST RELEVANT courses for their CURRENT STAGE, and provide a single, punchy, motivating sentence (max 15-20 words) explaining exactly WHY this specific course is perfect for them right now.

Do NOT return more than 4 courses. Rank them by relevance.

Candidate Courses:
${courses.map((c, i) => `${i+1}. ID: ${c.courseId} | Title: ${c.courseName} | Category: ${c.category}`).join('\n')}
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      explanations: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            courseId: { type: 'STRING' },
            explanation: { type: 'STRING' }
          },
          required: ['courseId', 'explanation']
        }
      }
    },
    required: ['explanations']
  };

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.5,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  try {
    const generatedText = await callGeminiWithRetry(url, requestBody);
    const parsed = JSON.parse(generatedText);
    
    const aiSelectedCourses = [];
    if (parsed.explanations && Array.isArray(parsed.explanations)) {
      for (const exp of parsed.explanations.slice(0, 4)) {
        const matchedCourse = courses.find(c => c.courseId === exp.courseId);
        if (matchedCourse) {
          aiSelectedCourses.push({
            ...(matchedCourse.toObject ? matchedCourse.toObject() : matchedCourse),
            aiExplanation: exp.explanation
          });
        }
      }
    }

    // Phase 9: Fallback if AI didn't return 4 valid courses
    if (aiSelectedCourses.length < 4) {
      for (const course of courses) {
         if (aiSelectedCourses.length >= 4) break;
         if (!aiSelectedCourses.some(c => c.courseId === course.courseId)) {
            aiSelectedCourses.push({
               ...(course.toObject ? course.toObject() : course),
               aiExplanation: `Recommended for your journey as a ${careerName}.`
            });
         }
      }
    }
    return aiSelectedCourses;
  } catch (error) {
    console.error('Failed to generate course explanations:', error);
    // Graceful fallback if AI fails, just return top 4 courses without AI explanation
    return courses.slice(0, 4).map(course => ({
      ...(course.toObject ? course.toObject() : course),
      aiExplanation: `Recommended for your journey as a ${careerName}.`
    }));
  }
};

/**
 * Generate a complete structured career roadmap for a custom/unknown career role.
 * Returns a roadmapTemplates-compatible object: { title, description, stages: [...] }
 */
export const generateCustomRoadmap = async (careerName) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const promptText = `
You are a career curriculum expert. Generate a complete, structured learning roadmap for the career: "${careerName}".

The roadmap must have 5-7 stages. Each stage has a title and 3-6 topics.
Topics that involve building something should have hours="Project" and diff="Advanced" or "Intermediate".
Other topics should have hours like "10 hours", "15 hours", etc.

Topic IDs must be unique strings (e.g. "custom-${careerName.toLowerCase().replace(/\s+/g, '-')}-f1").

Return ONLY valid JSON matching this exact schema:
{
  "title": "string (human-readable career name)",
  "description": "string (1-2 sentences about what this professional does)",
  "stages": [
    {
      "id": "unique-stage-id",
      "title": "STAGE NAME IN UPPERCASE",
      "topics": [
        {
          "id": "unique-topic-id",
          "title": "Topic Name",
          "diff": "Beginner|Intermediate|Advanced",
          "hours": "N hours OR Project"
        }
      ]
    }
  ]
}

The last stage MUST be called "PLACEMENT PREPARATION" and include: aptitude, interview questions, resume building, mock interviews.
One stage MUST be called "PROJECTS" with 2-3 real project ideas.
All other stages should be career-specific learning content.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      description: { type: 'STRING' },
      stages: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            title: { type: 'STRING' },
            topics: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  id: { type: 'STRING' },
                  title: { type: 'STRING' },
                  diff: { type: 'STRING' },
                  hours: { type: 'STRING' }
                },
                required: ['id', 'title', 'diff', 'hours']
              }
            }
          },
          required: ['id', 'title', 'topics']
        }
      }
    },
    required: ['title', 'description', 'stages']
  };

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  const generatedText = await callGeminiWithRetry(url, requestBody);
  try {
    return JSON.parse(generatedText);
  } catch (e) {
    console.error('Failed to parse custom roadmap JSON:', generatedText.substring(0, 200));
    throw new Error('AI generated malformed JSON for custom roadmap');
  }
};

/**
 * Generate semantic keywords, skills, and synonyms for a specific career role.
 */
export const generateRoleKeywords = async (careerName) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const promptText = `
You are an expert career and technical advisor.
Please generate a list of 10-15 highly relevant keywords, skills, technologies, and synonyms associated with the career: "${careerName}".
These keywords will be used in a database search to find relevant free courses. Include broad concepts and specific tools.
Return ONLY valid JSON matching this schema:
{
  "keywords": ["keyword1", "keyword2", ...]
}
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      keywords: {
        type: 'ARRAY',
        items: { type: 'STRING' }
      }
    },
    required: ['keywords']
  };

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  };

  const generatedText = await callGeminiWithRetry(url, requestBody);
  try {
    const parsed = JSON.parse(generatedText);
    return parsed.keywords || [];
  } catch (e) {
    console.error('Failed to parse role keywords JSON:', generatedText.substring(0, 200));
    return [];
  }
};

/**
 * Score a list of candidate courses based on their relevance to a career and keywords.
 */
export const scoreCourseRelevance = async (courses, careerName, keywords) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing in environment variables');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  // We only send minimal info to save tokens
  const minimalCourses = courses.map(c => ({
    courseId: c.courseId,
    courseName: c.courseName,
    skills: c.skillsArray ? c.skillsArray.join(', ') : '',
    category: c.category || ''
  }));

  const promptText = `
You are the Placement GPS AI Course Recommender.
The user is aiming to become a "${careerName}".
Important keywords for this role are: ${keywords.join(', ')}.

Below is a list of candidate free courses. 
For each course, evaluate how relevant it is for someone training to be a "${careerName}".
Calculate a 'relevanceScore' from 0 to 100.
Also provide a punchy 1-sentence 'explanation' (max 15 words) of why it fits this role.

Candidate Courses:
${JSON.stringify(minimalCourses, null, 2)}

Return ONLY valid JSON matching this schema:
{
  "scores": [
    {
      "courseId": "string",
      "relevanceScore": number,
      "explanation": "string"
    }
  ]
}
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      scores: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            courseId: { type: 'STRING' },
            relevanceScore: { type: 'INTEGER' },
            explanation: { type: 'STRING' }
          },
          required: ['courseId', 'relevanceScore', 'explanation']
        }
      }
    },
    required: ['scores']
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
    const generatedText = await callGeminiWithRetry(url, requestBody);
    const parsed = JSON.parse(generatedText);
    return parsed.scores || [];
  } catch (e) {
    console.error('Failed to parse course scores JSON:', e);
    // Fallback: Return dummy scores
    return courses.map(c => ({
      courseId: c.courseId,
      relevanceScore: 80,
      explanation: `Recommended for ${careerName}.`
    }));
  }
};

