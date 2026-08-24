import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceBlock = () => {
  const filePath = path.join(__dirname, '../../src/pages/aptitude/PracticeQuizPage.jsx');
  const code = fs.readFileSync(filePath, 'utf8');

  const startIdx = code.indexOf('// ─── Fetch Helpers');
  const endIdx = code.indexOf('// ─── Trigger prefetch');
  
  if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find boundaries in PracticeQuizPage.jsx');
    return;
  }

  const newBlock = `// ─── Fetch Helpers ─────────────────────────────────────────────────────────
  /**
   * Initial load: fetch 10 questions from the unified backend API.
   * The backend will automatically check the database and use AI to replenish if necessary.
   */
  const fetchInitialBatch = useCallback(async () => {
    try {
      setPageState('generating');
      setGeneratingMsg('✨ Loading your questions...');
      
      let loaded = [];

      if (isCompany) {
        const data = await aptitudeService.getCompanyQuestions({
          category: categoryId, topic: topicId, difficulty,
          company: company || 'All', source: source || 'All', limit: 10
        });
        loaded = data?.questions || [];
      } else {
        const dbData = await aptitudeService.getQuestions(categoryId, topicId, difficulty, 10, []);
        loaded = dbData?.questions || [];
      }

      if (loaded.length === 0) {
        if (isCompany) {
           setErrorMsg('No company questions available for these filters yet. Try changing the company or difficulty.');
        } else {
           setErrorMsg("We couldn't generate enough questions right now. Please try again.");
        }
        setPageState('error');
        return;
      }

      setQuestions(loaded);
      setPageState('quiz');
      startTimer();
      
      // Asynchronously prefetch more in background if we have fewer than 10
      if (loaded.length < 10 && !fetchingMoreRef.current) {
        prefetchMoreQuestions();
      }
    } catch (err) {
      console.error('fetchInitialBatch error:', err);
      setErrorMsg('Error connecting to the server. Please check your connection.');
      setPageState('error');
    }
  }, [categoryId, topicId, difficulty, isCompany, company, source, startTimer]);

  /**
   * Pre-fetch more questions when nearing the end of the loaded list.
   */
  const prefetchMoreQuestions = useCallback(async () => {
    if (fetchingMoreRef.current || isCompany) return;
    fetchingMoreRef.current = true;
    try {
      const currentIds = questions.map(q => q._id).filter(Boolean);
      const dbData = await aptitudeService.getQuestions(categoryId, topicId, difficulty, 10, currentIds);
      let newQs = dbData?.questions || [];

      if (newQs.length > 0) {
        setQuestions(prev => {
           // Prevent accidental duplicates on the frontend state
           const existingIds = new Set(prev.map(q => q._id));
           const uniqueNew = newQs.filter(q => !existingIds.has(q._id));
           return [...prev, ...uniqueNew];
        });
      }
    } catch (err) {
      console.error('prefetchMoreQuestions error:', err);
    } finally {
      fetchingMoreRef.current = false;
    }
  }, [categoryId, topicId, difficulty, isCompany, questions]);

  `;

  const finalCode = code.slice(0, startIdx) + newBlock + code.slice(endIdx);
  fs.writeFileSync(filePath, finalCode);
  console.log('Replaced block in PracticeQuizPage.jsx');
};

replaceBlock();
