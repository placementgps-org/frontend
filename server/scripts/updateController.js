import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentPath = path.join(__dirname, '../data/aptitudeContent.json');

// Helper to replace the block
const replaceBlock = () => {
  const filePath = path.join(__dirname, '../controllers/aptitudeController.js');
  const code = fs.readFileSync(filePath, 'utf8');

  // I will just use a regex to match the three functions and replace them with the new logic.
  // The block starts at `export const getQuestions` and ends just before `export const submitAttempt`.
  
  const startIdx = code.indexOf('export const getQuestions');
  const endIdx = code.indexOf('export const submitAttempt');
  
  if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find boundaries');
    return;
  }

  const newBlock = `
function normalizeQuestionText(text) {
    if (!text) return '';
    return text.toLowerCase().replace(/\\s+/g, ' ').replace(/[^\\w\\s%.-]/g, '').trim();
}

async function fetchOrGenerateQuestions(reqQuery, isCompany = false) {
  const { category, topic, difficulty, limit = 10, excludeIds, company, source } = reqQuery;
  const targetCount = Math.min(Math.max(Number(limit) || 10, 1), 20);

  const Model = isCompany ? CompanyQuestion : AptitudeQuestion;
  const filter = { active: true };
  if (category) filter.category = category;
  if (topic && topic !== 'All') filter.topic = topic;
  if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
  if (isCompany && company && company !== 'All') filter.company = company;
  if (isCompany && source && source !== 'All') {
    filter.questionType = source === 'Verified' ? 'Verified Actual' : 'Company-Style AI';
  }

  let excludeObjIds = [];
  if (excludeIds) {
    excludeObjIds = excludeIds.split(',').filter(id => id.length === 24).map(id => new mongoose.Types.ObjectId(id));
    if (excludeObjIds.length > 0) {
      filter._id = { $nin: excludeObjIds };
    }
  }

  // 1. Check existing questions
  const existingCount = await Model.countDocuments(filter);
  
  // 2. Replenish if missing
  if (existingCount < targetCount) {
    let missing = targetCount - existingCount;
    let attempts = 0;
    
    while (missing > 0 && attempts < 3) {
      attempts++;
      try {
        console.log(\`[AI QUIZ] Topic: \${topic} | Difficulty: \${difficulty} | Existing: \${existingCount} | Missing: \${missing} | Generating...\`);
        
        // Pass some existing questions to AI to avoid immediate duplicates
        const recentExisting = await Model.find(filter).select('question').limit(10);
        const existingTexts = recentExisting.map(q => q.question);

        // Generate missing + a small safety buffer (2)
        const generateCount = missing + 2;
        const aiBatch = await generateQuestionsFromAI(category, topic, difficulty, generateCount, isCompany, company, existingTexts);
        
        let validUnique = [];
        for (const q of aiBatch) {
          const norm = normalizeQuestionText(q.question);
          // Check DB
          const isDup = await Model.exists({ normalizedQuestion: norm, topic, difficulty, ...(isCompany && {company}) });
          if (!isDup) {
            q.normalizedQuestion = norm;
            validUnique.push(q);
          }
        }
        
        if (validUnique.length > 0) {
          await Model.insertMany(validUnique);
          console.log(\`[AI QUIZ] Saved \${validUnique.length} unique questions.\`);
          missing -= validUnique.length;
        } else {
          console.log(\`[AI QUIZ] AI generated 0 unique/valid questions this round.\`);
        }
      } catch (err) {
        console.error('[AI QUIZ] Generation attempt failed:', err.message);
        if (err.isRateLimit) break; // Don't loop endlessly if rate limited
      }
    }
  }

  // 3. Fetch exact requested amount (with projections applied for security)
  const finalQuestions = await Model.aggregate([
    { $match: filter },
    { $sample: { size: targetCount } },
    { $project: { correctAnswer: 0, explanation: 0, solution: 0, shortcut: 0 } }
  ]);
  
  return finalQuestions;
}

/**
 * @desc    Get practice questions for a topic (with AI auto-replenishment)
 * @route   GET /api/aptitude/questions
 * @access  Private
 */
export const getQuestions = async (req, res) => {
  try {
    const questions = await fetchOrGenerateQuestions(req.query, false);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get company-specific questions (with AI auto-replenishment)
 * @route   GET /api/aptitude/company-questions
 * @access  Private
 */
export const getCompanyQuestions = async (req, res) => {
  try {
    const questions = await fetchOrGenerateQuestions(req.query, true);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error in getCompanyQuestions:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Generate new AI questions (Deprecated, kept for compatibility if needed)
 * @route   POST /api/aptitude/generate
 * @access  Private
 */
export const generateQuestions = async (req, res) => {
  return res.status(400).json({ success: false, message: 'Deprecated. Use GET /api/aptitude/questions with limit.' });
};

`;

  const finalCode = code.slice(0, startIdx) + newBlock + code.slice(endIdx - 17); // Keep the JSDoc comment for submitAttempt
  fs.writeFileSync(filePath, finalCode);
  console.log('Replaced block');
};

replaceBlock();
