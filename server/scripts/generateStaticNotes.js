import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Local helper to call Gemini with retry (copied from aiService for script portability)
const callGeminiWithRetry = async (url, requestBody, maxRetries = 5) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await globalThis.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.status === 429) {
      let retryAfterMs = 30000;
      try {
        const errJson = await response.json();
        const retryInfo = errJson?.error?.details?.find(d => d.retryDelay);
        if (retryInfo?.retryDelay) {
          const secs = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
          retryAfterMs = (secs + 2) * 1000;
        }
      } catch { }

      if (attempt < maxRetries) {
        console.log(`Rate limited. Retrying in ${retryAfterMs / 1000}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, retryAfterMs));
        continue;
      }
      throw new Error('AI service rate limited.');
    }

    if (!response.ok) {
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

const generateTopicNotesFromAI = async (category, topicName) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const promptText = `Generate comprehensive permanent study notes for the topic "${topicName}" in the "${category}" category for placement exam preparation.

Provide exactly this structured JSON:
1. "overview": A string explaining what this topic is, why it matters in placement aptitude, and what type of questions companies commonly ask.
2. "formulas": Array of 3-6 key formulas/rules. Each must have "name" (string) and "explanation" (string).
3. "keyConcepts": Array of 4-6 strings, each explaining a fundamental concept.
4. "shortcuts": Array of 3-5 strings, each describing a useful trick or shortcut.
5. "mistakes": Array of 2-4 objects, each with "incorrect" (common mistake) and "correct" (how to avoid it).
6. "strategy": Array of 3-5 strings detailing a step-by-step solving approach.
7. "example": Object with either { "scenario": "...", "approach": "...", "conclusion": "..." } (for logical/situational) OR { "question": "...", "method": "...", "calculation": "...", "answer": "..." } (for numerical).

Make it concise, practical, and strictly for placement exams. Do NOT use conversational filler.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      overview: { type: 'STRING' },
      formulas: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { name: { type: 'STRING' }, explanation: { type: 'STRING' } },
          required: ['name', 'explanation']
        }
      },
      keyConcepts: { type: 'ARRAY', items: { type: 'STRING' } },
      shortcuts: { type: 'ARRAY', items: { type: 'STRING' } },
      mistakes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: { incorrect: { type: 'STRING' }, correct: { type: 'STRING' } },
          required: ['incorrect', 'correct']
        }
      },
      strategy: { type: 'ARRAY', items: { type: 'STRING' } },
      example: {
        type: 'OBJECT',
        properties: {
          scenario: { type: 'STRING' }, approach: { type: 'STRING' }, conclusion: { type: 'STRING' },
          question: { type: 'STRING' }, method: { type: 'STRING' }, calculation: { type: 'STRING' }, answer: { type: 'STRING' }
        }
      }
    },
    required: ['overview', 'formulas', 'keyConcepts', 'shortcuts', 'mistakes', 'strategy', 'example']
  };

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json', responseSchema: schema }
  };

  const generatedText = await callGeminiWithRetry(url, requestBody);
  return JSON.parse(generatedText);
};

const run = async () => {
  const jsonPath = path.join(__dirname, '../data/aptitudeContent.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let generatedCount = 0;

  for (const cat of data.categories) {
    const topics = data.topics[cat.id];
    for (const topic of topics) {
      if (!topic.content || !topic.content.overview) {
        console.log(`Generating notes for [${cat.id}] ${topic.name}...`);
        try {
          topic.content = await generateTopicNotesFromAI(cat.id, topic.name);
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          generatedCount++;
          console.log(`✓ Saved notes for ${topic.name}`);
          // Add a small delay to avoid hitting limits too fast
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (e) {
          console.error(`✗ Failed generating for ${topic.name}:`, e.message);
        }
      }
    }
  }

  console.log(`\nFinished! Generated ${generatedCount} new topic notes.`);
};

run();
