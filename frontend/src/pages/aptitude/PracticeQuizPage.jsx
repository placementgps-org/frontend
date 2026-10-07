import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Lightbulb,
  ChevronRight, Zap, Clock, Target, Building2, BookOpen, Sparkles, RefreshCw
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { aptitudeService } from '../../services/aptitudeService';

export default function PracticeQuizPage() {
  const { categoryId, topicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const difficulty = queryParams.get('difficulty') || 'Easy';
  const isCompany = queryParams.get('isCompany') === 'true';
  const company = queryParams.get('company');
  const source = queryParams.get('source');

  // ─── State ────────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  const [pageState, setPageState] = useState('loading'); // 'loading' | 'generating' | 'quiz' | 'checkpoint' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [generatingMsg, setGeneratingMsg] = useState('');

  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [sessionResults, setSessionResults] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const [timeTaken, setTimeTaken] = useState(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Track if we are currently fetching more to avoid duplicate fetches
  const fetchingMoreRef = useRef(false);

  // ─── Reset & Boot ─────────────────────────────────────────────────────────
  useEffect(() => {
    setQuestions([]);
    setCurrentIdx(0);
    setSessionResults([]);
    setResult(null);
    setSelectedOption(null);
    setShowHint(false);
    setTotalTimeTaken(0);
    setErrorMsg('');
    setGeneratingMsg('');
    setPageState('loading');
    fetchingMoreRef.current = false;
    fetchInitialBatch();
    return () => clearInterval(timerRef.current);
  }, [categoryId, topicId, difficulty, isCompany, company, source]);

  // ─── Timer ────────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    setTimeTaken(0);
    timerRef.current = setInterval(() => {
      setTimeTaken(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    return Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Fetch Helpers ─────────────────────────────────────────────────────────
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

  // ─── Trigger prefetch when near the end of the loaded list ────────────────
  useEffect(() => {
    if (pageState !== 'quiz') return;
    const remaining = questions.length - 1 - currentIdx;
    if (remaining <= 3 && !fetchingMoreRef.current) {
      prefetchMoreQuestions();
    }
  }, [currentIdx, questions.length, pageState, prefetchMoreQuestions]);

  // ─── Submit Answer ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedOption || submitting || result) return;
    setSubmitting(true);
    const elapsed = stopTimer();
    setTotalTimeTaken(prev => prev + elapsed);

    try {
      const currentQ = questions[currentIdx];
      const data = await aptitudeService.submitAttempt(currentQ._id, selectedOption, elapsed);
      if (data?.success) {
        setResult(data);
        setSessionResults(prev => [...prev, { ...data, question: currentQ }]);
      } else {
        console.error('Submission failed', data);
        // Still show the result with fallback
        setResult({ ...data, isCorrect: false });
      }
    } catch (err) {
      console.error('Submit error:', err);
      // Don't block the user — show an error result so they can continue
      setResult({ success: false, isCorrect: false, explanation: 'Could not save your answer. Please check your connection.' });
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Next Question ─────────────────────────────────────────────────────────
  const handleNext = () => {
    const completed = sessionResults.length;
    // Show checkpoint every 10 questions
    if (completed > 0 && completed % 10 === 0) {
      setPageState('checkpoint');
    } else {
      advanceToNextQuestion();
    }
  };

  const advanceToNextQuestion = () => {
    setPageState('quiz');
    setCurrentIdx(prev => prev + 1);
    setSelectedOption(null);
    setResult(null);
    setShowHint(false);
    startTimer();
  };

  const moveToNextLevel = () => {
    const nextDiff = difficulty === 'Easy' ? 'Medium' : 'Hard';
    navigate(`/practice/${categoryId}/${topicId}/quiz?difficulty=${nextDiff}`);
  };

  // ─── Render: Loading / Generating ────────────────────────────────────────
  if (pageState === 'loading' || pageState === 'generating') {
    return (
      <div className="min-h-screen bg-[#05070F] flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-800 border-t-[#2F80FF] rounded-full animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto text-[#2F80FF] animate-pulse" size={20} />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">
            {pageState === 'generating' ? generatingMsg : 'Loading practice session...'}
          </p>
          {pageState === 'generating' && (
            <p className="text-slate-500 text-sm mt-1">AI is crafting questions tailored for {difficulty} {topicId.replace(/-/g, ' ')}...</p>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Error ────────────────────────────────────────────────────────
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-[#05070F] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md w-full">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-500 opacity-60" />
          <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-slate-400 mb-6 text-sm">{errorMsg}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPageState('loading'); fetchInitialBatch(); }}
              className="w-full py-3 bg-[#2F80FF] hover:bg-[#3B8BFF] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Try Again
            </button>
            <button
              onClick={() => navigate(`/practice/${categoryId}/${topicId}`)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
            >
              Back to Topic
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Checkpoint ───────────────────────────────────────────────────
  if (pageState === 'checkpoint') {
    const recentResults = sessionResults.slice(-10);
    const correctCount = recentResults.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correctCount / recentResults.length) * 100);

    let recTitle, recDesc;
    if (difficulty === 'Hard') {
      recTitle = accuracy >= 70 ? '🏆 Excellent Hard-Level Performance!' : '📚 Keep Practicing Hard';
      recDesc = accuracy >= 70
        ? 'Outstanding! Consider tackling company-specific questions next.'
        : 'Good effort. Review the concepts and continue practicing hard-level questions.';
    } else if (accuracy >= 80) {
      recTitle = '🎯 Outstanding! Time to Level Up';
      recDesc = `You scored ${accuracy}% — you are ready to move to ${difficulty === 'Easy' ? 'Medium' : 'Hard'} level questions.`;
    } else if (accuracy >= 50) {
      recTitle = '📈 Good Progress!';
      recDesc = 'You are understanding the concepts. A bit more practice will help before moving up.';
    } else {
      recTitle = '📚 Keep Going';
      recDesc = 'Review the study notes and keep practicing at this level to build confidence.';
    }

    return (
      <div className="min-h-screen bg-[#05070F] text-white font-sans overflow-x-hidden flex flex-col">
        <Navbar onOpenLogin={() => {}} isAuthPage />
        <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-10">
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target size={48} />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{sessionResults.length} Questions Done!</h1>
            <p className="text-slate-400">Progress checkpoint for the last 10 questions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-2xl border border-slate-800 text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">{recTitle}</h2>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#4FA3FF] mb-1">{accuracy}%</div>
                <div className="text-slate-400 text-sm">Accuracy</div>
              </div>
              <div className="h-14 border-l border-slate-700"></div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-1">{correctCount}/10</div>
                <div className="text-slate-400 text-sm">Correct</div>
              </div>
              <div className="h-14 border-l border-slate-700"></div>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  difficulty === 'Easy' ? 'text-emerald-400' :
                  difficulty === 'Medium' ? 'text-amber-400' : 'text-red-400'
                }`}>{difficulty}</div>
                <div className="text-slate-400 text-sm">Level</div>
              </div>
            </div>
            <p className="text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 text-sm leading-relaxed">{recDesc}</p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={advanceToNextQuestion}
              className="py-3.5 px-6 font-bold rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white transition-colors flex-1 text-center"
            >
              Continue {difficulty}
            </button>
            {difficulty !== 'Hard' && (
              <button
                onClick={moveToNextLevel}
                className="py-3.5 px-6 font-bold rounded-xl bg-gradient-to-r from-[#2F80FF] to-[#1D5BD8] hover:from-[#3B8BFF] text-white transition-all flex-1 text-center"
              >
                Move to {difficulty === 'Easy' ? 'Medium' : 'Hard'}
              </button>
            )}
            {difficulty === 'Hard' && accuracy >= 70 && (
              <button
                onClick={() => navigate(`/practice/${categoryId}/${topicId}/company`)}
                className="py-3.5 px-6 font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white transition-all flex-1 flex items-center justify-center gap-2"
              >
                <Building2 size={18} /> Company Questions
              </button>
            )}
          </div>
          {difficulty === 'Hard' && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => navigate('/practice')}
                className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <BookOpen size={16} /> Browse Other Topics
              </button>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Render: Quiz ─────────────────────────────────────────────────────────
  const currentQ = questions[currentIdx];

  // Safety: if somehow we advanced past the loaded list, show a brief loading
  if (!currentQ) {
    return (
      <div className="min-h-screen bg-[#05070F] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[#2F80FF] rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">Loading next question...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] font-sans overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/practice/${categoryId}/${topicId}`)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Quit Practice
          </button>
          <div className="text-sm font-medium text-slate-400 flex items-center gap-4">
            <span>
              Attempted: <span className="text-white font-bold">{sessionResults.length}</span>
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold ${
              difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
              difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
            }`}>{difficulty}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800/60 relative overflow-hidden"
          >
            {/* Difficulty badge */}
            <div className="flex flex-wrap justify-between items-start gap-2 mb-6">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md tracking-wide uppercase ${
                currentQ.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                currentQ.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {currentQ.difficulty}
              </span>
              <div className="flex gap-2">
                {currentQ.company && currentQ.company !== 'General' && (
                  <span className="text-xs font-medium px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-md">
                    {Array.isArray(currentQ.company) ? currentQ.company[0] : currentQ.company}
                  </span>
                )}
                {currentQ.concept && (
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md">
                    {currentQ.concept}
                  </span>
                )}
              </div>
            </div>

            {/* Question */}
            <h2 className="text-lg md:text-xl font-medium text-white mb-8 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                let cls = 'border-slate-700 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50 cursor-pointer';
                let Icon = null;

                if (result) {
                  cls = 'border-slate-800 bg-slate-900/20 text-slate-500 cursor-not-allowed opacity-50';
                  if (opt === result.correctAnswer) {
                    cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100 cursor-default shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                    Icon = <CheckCircle2 size={18} className="text-emerald-400" />;
                  } else if (isSelected && !result.isCorrect) {
                    cls = 'border-red-500/50 bg-red-500/10 text-red-100 cursor-default';
                    Icon = <XCircle size={18} className="text-red-400" />;
                  }
                } else if (isSelected) {
                  cls = 'border-[#4FA3FF] bg-[#2F80FF]/10 text-white shadow-[0_0_15px_rgba(47,128,255,0.15)]';
                }

                return (
                  <div
                    key={idx}
                    onClick={() => !result && setSelectedOption(opt)}
                    className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${cls}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border transition-colors ${
                        result && opt === result.correctAnswer ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                        result && isSelected && !result.isCorrect ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                        isSelected ? 'bg-[#2F80FF] border-[#2F80FF] text-white' :
                        'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={result && opt === result.correctAnswer ? 'font-medium' : ''}>{opt}</span>
                    </div>
                    {Icon}
                  </div>
                );
              })}
            </div>

            {/* Hint button (before result) */}
            {!result && currentQ.shortcut && (
              <div className="mb-4">
                <button
                  onClick={() => setShowHint(h => !h)}
                  className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  <Lightbulb size={14} /> {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 text-amber-200 text-sm"
                  >
                    💡 {currentQ.shortcut}
                  </motion.div>
                )}
              </div>
            )}

            {/* Submit button */}
            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedOption || submitting}
                className={`w-full py-3.5 px-6 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                  !selectedOption || submitting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#2F80FF] to-[#1D5BD8] hover:from-[#3B8BFF] text-white hover:-translate-y-0.5'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking Answer...
                  </>
                ) : 'Submit Answer'}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 space-y-4"
              >
                {/* Result banner */}
                <div className={`p-4 rounded-xl flex items-start gap-4 border ${
                  result.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'
                }`}>
                  <div className={`mt-0.5 ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg mb-1 ${result.isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.isCorrect ? 'Correct!' : 'Incorrect'}
                    </h3>
                    {!result.isCorrect && result.correctAnswer && (
                      <p className="text-slate-300 text-sm mb-2">
                        Correct answer: <span className="font-bold text-white">{result.correctAnswer}</span>
                      </p>
                    )}
                    {result.explanation && (
                      <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
                    )}
                  </div>
                </div>

                {/* Step-by-step solution */}
                {result.solution?.length > 0 && (
                  <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/80">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Lightbulb size={16} /> Step-by-Step Solution
                    </h4>
                    <ol className="space-y-3">
                      {result.solution.map((step, sIdx) => (
                        <li key={sIdx} className="flex gap-3 text-slate-300 text-sm">
                          <span className="text-slate-500 font-mono mt-0.5 shrink-0 w-5">{sIdx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Shortcut tip */}
                {result.shortcut && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                    <Zap size={18} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Time-Saving Trick</h4>
                      <p className="text-slate-300 text-sm">{result.shortcut}</p>
                    </div>
                  </div>
                )}

                {/* Next button */}
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 px-6 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 border border-slate-600 text-white"
                >
                  Next Question <ChevronRight size={18} />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Session progress bar */}
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
          <span>Session: {sessionResults.length} answered</span>
          {sessionResults.length > 0 && (
            <span className="text-emerald-500">
              ({Math.round(sessionResults.filter(r => r.isCorrect).length / sessionResults.length * 100)}% accuracy)
            </span>
          )}
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2F80FF] to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(((sessionResults.length % 10) / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <span>{10 - (sessionResults.length % 10)} to checkpoint</span>
        </div>
      </main>
    </div>
  );
}
