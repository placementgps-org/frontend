import dotenv from 'dotenv';
dotenv.config();
import CodingChallenge from '../models/CodingChallenge.js';
import CodingAttempt from '../models/CodingAttempt.js';
import CodingProgress from '../models/CodingProgress.js';
import { executeCodeOnTestCases } from './codeExecutionService.js';

export const CODING_TOPICS = {
  programming: [
    { id: 'variables_datatypes', name: 'Variables & Data Types', icon: 'Box' },
    { id: 'operators_expressions', name: 'Operators & Expressions', icon: 'Binary' },
    { id: 'conditionals', name: 'Conditionals (If-Else & Switch)', icon: 'GitBranch' },
    { id: 'loops_iterations', name: 'Loops & Iterations', icon: 'Repeat' },
    { id: 'functions_scope', name: 'Functions & Scope', icon: 'FunctionSquare' },
    { id: 'arrays_basic', name: 'Arrays & Lists', icon: 'Layers' },
    { id: 'strings_basic', name: 'Strings & Character Manipulation', icon: 'Type' },
    { id: 'recursion_basic', name: 'Recursion Fundamentals', icon: 'RotateCcw' },
    { id: 'pattern_printing', name: 'Pattern Printing Problems', icon: 'Grid' },
    { id: 'number_theory', name: 'Number & Math Problems', icon: 'Hash' },
    { id: 'searching_basic', name: 'Linear & Binary Search', icon: 'Search' },
    { id: 'sorting_basic', name: 'Sorting (Bubble, Selection, Insertion)', icon: 'ArrowUpDown' },
    { id: 'basic_problem_solving', name: 'Basic Problem Solving & Logic', icon: 'Brain' }
  ],
  dsa: [
    { id: 'arrays_dsa', name: 'Arrays & Subarrays', icon: 'Layers' },
    { id: 'strings_dsa', name: 'Strings & Two Pointers', icon: 'Type' },
    { id: 'linked_lists', name: 'Linked Lists (Singly & Doubly)', icon: 'Link' },
    { id: 'stacks', name: 'Stack & Monotonic Stack', icon: 'AlignVerticalBottom' },
    { id: 'queues', name: 'Queue & Deque', icon: 'ListOrdered' },
    { id: 'hashing', name: 'Hashing & Hash Maps', icon: 'KeyRound' },
    { id: 'recursion_backtracking', name: 'Recursion & Backtracking', icon: 'RotateCcw' },
    { id: 'trees_binary_trees', name: 'Binary Trees & Traversals', icon: 'Network' },
    { id: 'bst', name: 'Binary Search Trees (BST)', icon: 'GitMerge' },
    { id: 'heaps_priority_queues', name: 'Heaps & Priority Queues', icon: 'Flame' },
    { id: 'graphs', name: 'Graphs (BFS, DFS, Dijkstra)', icon: 'Share2' },
    { id: 'sliding_window', name: 'Sliding Window Technique', icon: 'SlidersHorizontal' },
    { id: 'greedy', name: 'Greedy Algorithms', icon: 'Zap' },
    { id: 'dynamic_programming_1d', name: 'Dynamic Programming (1D)', icon: 'Cpu' },
    { id: 'dynamic_programming_2d', name: 'Dynamic Programming (2D & Grids)', icon: 'Grid3X3' }
  ]
};

// In-flight generation mutex map to deduplicate concurrent requests for the same topic
const inFlightGenerations = new Map();

/**
 * Call Gemini REST API with exponential backoff.
 */
async function callGeminiWithRetry(url, requestBody, maxRetries = 3) {
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
        const retryInfo = errJson?.error?.details?.find((d) => d.retryDelay);
        if (retryInfo?.retryDelay) {
          const secs = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
          if (secs > 0 && secs <= 15) retryAfterMs = secs * 1000;
        }
      } catch {
        // ignore
      }

      if (attempt < maxRetries) {
        console.log(`[CodingChallenge] Gemini 429 rate limited. Retrying in ${retryAfterMs / 1000}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, retryAfterMs));
        continue;
      }
      throw new Error('AI service is temporarily busy. Please try again in a moment.');
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('[CodingChallenge] Gemini API Error:', errText);
      throw new Error(`AI API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error('AI returned an empty response');
    return generatedText;
  }
}

/**
 * Generates an AI coding challenge with single-call structured schema
 * and sandboxed test case validation against reference solution.
 */
export async function generateAndValidateCodingChallenge({
  track = 'programming',
  topic = 'Arrays & Lists',
  difficulty = 'Easy',
  userId = null,
  recentTitles = []
}) {
  const generationKey = `${track}:${topic}:${difficulty}`;

  // Deduplicate in-flight generations for the exact same track/topic/difficulty
  if (inFlightGenerations.has(generationKey)) {
    console.log(`[CodingChallenge] In-flight AI generation already in progress for ${generationKey}. Reusing active job...`);
    return await inFlightGenerations.get(generationKey);
  }

  const generationPromise = (async () => {
    const startTime = Date.now();
    let aiTimeMs = 0;
    let valTimeMs = 0;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in server environment');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    // Check student historical progress for topic adaptation
    let studentContext = '';
    if (userId) {
      try {
        const progress = await CodingProgress.findOne({ user: userId });
        if (progress && progress.topicStats) {
          const tStat = progress.topicStats.get(topic);
          if (tStat) {
            studentContext = `Student has solved ${tStat.solved || 0}/${tStat.attempted || 0} problems in ${topic}. Consecutive successes: ${tStat.consecutiveSuccesses || 0}.`;
          }
        }
      } catch {
        // non-blocking
      }
    }

    const prompt = `You are a Principal Software Engineering & DSA Educator at Placement GPS.
Generate a high-quality, practical coding challenge for university placements and technical interviews.

Track: "${track.toUpperCase()}" (Programming or DSA)
Topic: "${topic}"
Difficulty: "${difficulty}" (Easy, Medium, or Hard)
${studentContext ? `Student Context: ${studentContext}` : ''}

${recentTitles.length > 0 ? `DO NOT duplicate or generate exact copies of these recent challenges:\n${recentTitles.map((t) => `- ${t}`).join('\n')}\n` : ''}

REQUIREMENTS:
1. "title": Crisp, professional title (e.g. "Find Peak Element in Unsorted Array", "Subarray with Target Sum").
2. "description": Detailed problem statement in clear Markdown. Explain input logic and goal precisely.
3. "inputFormat": Clear description of standard input (e.g., "First line contains integer N. Second line contains N space-separated integers.").
4. "outputFormat": Exact format of expected stdout (e.g., "Print single integer representing the maximum sum.").
5. "constraints": Array of 2-5 constraint strings (e.g. ["1 <= N <= 10^5", "-10^4 <= arr[i] <= 10^4"]).
6. "examples": Exactly 2 clear examples with "input", "output", and "explanation".
7. "visibleTestCases": Array of 2-3 standard test cases with "input" (stdin) and "expectedOutput" (stdout).
8. "hiddenTestCases": Array of 5-7 robust test cases including normal, edge, boundary, duplicate, and large cases.
9. "starterTemplates":
   - "python": Clean starter code with sys.stdin reading helper (def solve(): ... if __name__ == '__main__': solve()).
   - "javascript": Clean starter code with fs.readFileSync(0, 'utf-8') input parsing.
   - "java": Clean starter code with public class Main and Scanner.
   - "cpp": Clean starter code with #include <iostream> and int main().
10. "referenceSolution":
    - "language": "python"
    - "code": 100% correct, working Python 3 code that reads from stdin and prints output. This will be automatically executed to validate the test cases.
11. "hints": Array of 2 progressive hints (Hint 1: subtle conceptual clue, Hint 2: algorithmic direction). DO NOT provide solution code or answer in hints!
12. "tags": Array of 2-4 keywords (e.g. ["arrays", "prefix-sum", "two-pointers"]).

Standard I/O convention: Code reads input from STDIN and prints result to STDOUT. Expected outputs must strictly match.`;

    const schema = {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        description: { type: 'STRING' },
        inputFormat: { type: 'STRING' },
        outputFormat: { type: 'STRING' },
        constraints: { type: 'ARRAY', items: { type: 'STRING' } },
        examples: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              input: { type: 'STRING' },
              output: { type: 'STRING' },
              explanation: { type: 'STRING' }
            },
            required: ['input', 'output', 'explanation']
          }
        },
        visibleTestCases: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              input: { type: 'STRING' },
              expectedOutput: { type: 'STRING' }
            },
            required: ['input', 'expectedOutput']
          }
        },
        hiddenTestCases: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              input: { type: 'STRING' },
              expectedOutput: { type: 'STRING' }
            },
            required: ['input', 'expectedOutput']
          }
        },
        starterTemplates: {
          type: 'OBJECT',
          properties: {
            python: { type: 'STRING' },
            javascript: { type: 'STRING' },
            java: { type: 'STRING' },
            cpp: { type: 'STRING' }
          },
          required: ['python', 'javascript']
        },
        referenceSolution: {
          type: 'OBJECT',
          properties: {
            language: { type: 'STRING' },
            code: { type: 'STRING' }
          },
          required: ['language', 'code']
        },
        hints: { type: 'ARRAY', items: { type: 'STRING' } },
        tags: { type: 'ARRAY', items: { type: 'STRING' } }
      },
      required: [
        'title',
        'description',
        'inputFormat',
        'outputFormat',
        'constraints',
        'examples',
        'visibleTestCases',
        'hiddenTestCases',
        'starterTemplates',
        'referenceSolution',
        'hints'
      ]
    };

    const requestBody = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: 'application/json',
        responseSchema: schema
      }
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const aiStart = Date.now();
        const generatedText = await callGeminiWithRetry(url, requestBody);
        aiTimeMs = Date.now() - aiStart;

        const parsed = JSON.parse(generatedText);

        if (!parsed.title || !parsed.description || !parsed.visibleTestCases?.length || !parsed.hiddenTestCases?.length) {
          throw new Error('AI response is missing essential challenge fields');
        }

        if (!parsed.starterTemplates.python) {
          parsed.starterTemplates.python = `import sys\n\ndef solve():\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    solve()\n`;
        }
        if (!parsed.starterTemplates.javascript) {
          parsed.starterTemplates.javascript = `const fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    // Write your solution here\n}\n\nsolve();\n`;
        }

        // Validate test cases against reference solution
        const valStart = Date.now();
        const allTestCases = [...parsed.visibleTestCases, ...parsed.hiddenTestCases];

        if (parsed.referenceSolution && parsed.referenceSolution.code) {
          const validationResult = await executeCodeOnTestCases({
            language: parsed.referenceSolution.language || 'python',
            code: parsed.referenceSolution.code,
            testCases: allTestCases
          });
          valTimeMs = Date.now() - valStart;

          if (!validationResult.allPassed) {
            let canAutoFix = true;
            for (let i = 0; i < validationResult.results.length; i++) {
              const r = validationResult.results[i];
              if (r.status === 'Runtime Error' || r.status === 'Time Limit Exceeded' || !r.actualOutput) {
                canAutoFix = false;
                break;
              }
            }

            if (canAutoFix) {
              const visibleCount = parsed.visibleTestCases.length;
              parsed.visibleTestCases = parsed.visibleTestCases.map((tc, idx) => ({
                input: tc.input,
                expectedOutput: validationResult.results[idx].actualOutput.trim()
              }));
              parsed.hiddenTestCases = parsed.hiddenTestCases.map((tc, idx) => ({
                input: tc.input,
                expectedOutput: validationResult.results[visibleCount + idx].actualOutput.trim()
              }));
            } else if (attempt === 1) {
              continue;
            }
          }
        }

        const cleanTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
        const challengeId = `cc-${track}-${cleanTopic}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

        const newChallenge = new CodingChallenge({
          challengeId,
          track,
          topic,
          difficulty,
          title: parsed.title,
          description: parsed.description,
          inputFormat: parsed.inputFormat || '',
          outputFormat: parsed.outputFormat || '',
          constraints: parsed.constraints || [],
          examples: parsed.examples || [],
          visibleTestCases: parsed.visibleTestCases,
          hiddenTestCases: parsed.hiddenTestCases,
          starterTemplates: parsed.starterTemplates,
          referenceSolution: parsed.referenceSolution,
          hints: parsed.hints || [],
          tags: parsed.tags || [topic.toLowerCase()],
          createdBy: 'ai'
        });

        await newChallenge.save();

        const totalTimeMs = Date.now() - startTime;
        console.log(
          `[CodingPerf] ✨ AI Challenge Created: "${newChallenge.title}" (${track}/${topic}/${difficulty}) | AI: ${aiTimeMs}ms | Val: ${valTimeMs}ms | Total: ${totalTimeMs}ms`
        );

        return newChallenge;
      } catch (err) {
        console.error(`[CodingChallenge] Generation attempt ${attempt} error:`, err.message);
        if (attempt === 2) throw err;
      }
    }
  })();

  inFlightGenerations.set(generationKey, generationPromise);

  try {
    return await generationPromise;
  } finally {
    inFlightGenerations.delete(generationKey);
  }
}

/**
 * Triggers background pre-generation of the next challenge if pool is low.
 * Non-blocking, detached execution with safety boundaries.
 */
export function triggerBackgroundPreGeneration({ track, topic, difficulty, userId = null }) {
  setImmediate(async () => {
    try {
      // Check existing unattempted count in MongoDB
      const count = await CodingChallenge.countDocuments({ track, topic, difficulty });
      if (count >= 3) {
        return; // Pool already has sufficient buffer
      }

      console.log(`[CodingPreGen] ⚡ Triggering background pre-generation for ${track} -> ${topic} (${difficulty}) [Current pool: ${count}]`);
      await generateAndValidateCodingChallenge({
        track,
        topic,
        difficulty,
        userId
      });
    } catch (err) {
      console.warn(`[CodingPreGen] Background pre-generation error (non-blocking):`, err.message);
    }
  });
}

/**
 * Pre-warms the question pool for common topics on startup if empty.
 */
export async function prewarmStarterTopics() {
  const starterTopics = [
    { track: 'programming', topic: 'Variables & Data Types', difficulty: 'Easy' },
    { track: 'programming', topic: 'Loops & Iterations', difficulty: 'Easy' },
    { track: 'programming', topic: 'Arrays & Lists', difficulty: 'Easy' },
    { track: 'dsa', topic: 'Arrays & Subarrays', difficulty: 'Easy' },
    { track: 'dsa', topic: 'Arrays & Subarrays', difficulty: 'Medium' }
  ];

  for (const item of starterTopics) {
    try {
      const existing = await CodingChallenge.countDocuments({
        track: item.track,
        topic: item.topic,
        difficulty: item.difficulty
      });

      if (existing === 0) {
        console.log(`[CodingPrewarm] Pre-warming challenge pool for ${item.track} -> ${item.topic} (${item.difficulty})...`);
        await generateAndValidateCodingChallenge({
          track: item.track,
          topic: item.topic,
          difficulty: item.difficulty
        });
      }
    } catch (err) {
      console.warn(`[CodingPrewarm] Skipping ${item.topic}:`, err.message);
    }
  }
}

/**
 * Updates student progress and topic mastery metrics on submission.
 */
export async function recordChallengeSubmission({
  userId,
  challenge,
  language,
  submittedCode,
  isRunOnly,
  executionResult
}) {
  const { allPassed, results } = executionResult;
  const totalTimeMs = results.reduce((acc, r) => acc + (r.executionTimeMs || 0), 0);

  if (!isRunOnly && userId) {
    let progress = await CodingProgress.findOne({ user: userId });
    if (!progress) {
      progress = new CodingProgress({ user: userId, topicStats: {} });
    }

    progress.totalAttempted += 1;

    const currentTopicStat = progress.topicStats.get(challenge.topic) || {
      attempted: 0,
      solved: 0,
      consecutiveSuccesses: 0,
      consecutiveFailures: 0,
      recommendedDifficulty: 'Easy'
    };

    currentTopicStat.attempted += 1;

    if (allPassed) {
      currentTopicStat.solved += 1;
      currentTopicStat.consecutiveSuccesses += 1;
      currentTopicStat.consecutiveFailures = 0;

      if (currentTopicStat.consecutiveSuccesses >= 2) {
        if (challenge.difficulty === 'Easy') currentTopicStat.recommendedDifficulty = 'Medium';
        else if (challenge.difficulty === 'Medium') currentTopicStat.recommendedDifficulty = 'Hard';
      }

      const alreadySolved = progress.solvedChallenges.some(
        (sc) => sc.challengeId === challenge.challengeId
      );

      if (!alreadySolved) {
        progress.totalSolved += 1;
        if (challenge.track === 'programming') progress.programmingSolved += 1;
        if (challenge.track === 'dsa') progress.dsaSolved += 1;
        if (challenge.difficulty === 'Easy') progress.easySolved += 1;
        else if (challenge.difficulty === 'Medium') progress.mediumSolved += 1;
        else if (challenge.difficulty === 'Hard') progress.hardSolved += 1;

        progress.solvedChallenges.push({
          challenge: challenge._id,
          challengeId: challenge.challengeId,
          track: challenge.track,
          topic: challenge.topic,
          difficulty: challenge.difficulty,
          language,
          solvedAt: new Date()
        });
      }
    } else {
      currentTopicStat.consecutiveFailures += 1;
      currentTopicStat.consecutiveSuccesses = 0;

      if (currentTopicStat.consecutiveFailures >= 2) {
        if (challenge.difficulty === 'Hard') currentTopicStat.recommendedDifficulty = 'Medium';
        else if (challenge.difficulty === 'Medium') currentTopicStat.recommendedDifficulty = 'Easy';
      }
    }

    progress.topicStats.set(challenge.topic, currentTopicStat);
    await progress.save();

    await CodingChallenge.findByIdAndUpdate(challenge._id, {
      $inc: {
        totalSubmissions: 1,
        totalAccepted: allPassed ? 1 : 0
      }
    });
  }

  return {
    allPassed,
    passedCount: executionResult.passedCount,
    totalCount: executionResult.totalCount,
    overallStatus: executionResult.overallStatus,
    executionTimeMs: totalTimeMs
  };
}
