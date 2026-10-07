import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Target, BookOpen, Calculator, AlertTriangle,
  Zap, Sparkles, Building2, CheckCircle2, XCircle, Brain, ChevronDown, ChevronUp
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { aptitudeService } from '../../services/aptitudeService';
import { useAuth } from '../../context/AuthContext';

export default function TopicLearnPage() {
  const { categoryId, topicId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [topic, setTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collapsible sections
  const [openSections, setOpenSections] = useState({ 
    formulas: true, concepts: true, shortcuts: true, mistakes: false 
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await aptitudeService.getTopicContent(categoryId, topicId);
        if (data && data.success) {
          setTopic(data.topic);
          setProgress(data.progress);
        } else {
          setError('Failed to fetch topic content');
        }
      } catch (err) {
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [categoryId, topicId]);

  const startPractice = (difficulty) => {
    if (!isAuthenticated) {
      return navigate(`/login?redirect=/practice/${categoryId}/${topicId}/quiz?difficulty=${difficulty}`);
    }
    navigate(`/practice/${categoryId}/${topicId}/quiz?difficulty=${difficulty}`);
  };

  const startCompanyPractice = () => {
    if (!isAuthenticated) {
      return navigate(`/login?redirect=/practice/${categoryId}/${topicId}/company`);
    }
    navigate(`/practice/${categoryId}/${topicId}/company`);
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070F] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-[#2F80FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-[#05070F] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center text-red-400">
          {error || 'Topic not found'}
          <button
            onClick={() => navigate(`/practice/${categoryId}`)}
            className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 block mx-auto"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Display strictly static content
  const displayContent = topic.content;

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/practice/${categoryId}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft size={16} />
          Back to Topics
        </button>

        {/* Topic Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800/60 relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2F80FF] rounded-full mix-blend-multiply filter blur-3xl opacity-5 pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex flex-col relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-[#4FA3FF] tracking-wider uppercase px-2 py-1 bg-[#2F80FF]/10 rounded-md">
                Priority #{topic.priority}
              </span>
              <span className="text-xs font-medium text-slate-400 capitalize">
                {categoryId} Practice
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-6">
              {topic.name}
            </h1>

            {isAuthenticated && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Questions Attempted</span>
                  <span className="text-2xl font-bold text-white">{progress?.totalAttempts || 0}</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Accuracy</span>
                  <span className="text-2xl font-bold text-[#4FA3FF]">{progress?.accuracy || 0}%</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Correct</span>
                  <span className="text-2xl font-bold text-emerald-400">{progress?.correctAnswers || 0}</span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col gap-1">
                  <span className="text-slate-400 font-medium">Current Level</span>
                  <span className="text-2xl font-bold text-amber-400">
                    {(progress?.accuracy || 0) > 80 ? 'Hard' : (progress?.accuracy || 0) > 50 ? 'Medium' : 'Easy'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Learning Content Section */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              📚 Study Notes
            </h2>
            <span className="text-xs px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md font-medium">
              Verified Material
            </span>
          </div>

          {!displayContent && (
            <div className="glass-card rounded-2xl p-8 border border-slate-800/60 text-center">
              <p className="text-slate-400 font-medium">Study notes are currently being prepared for this topic.</p>
              <p className="text-slate-500 text-sm mt-1">You can still jump right into practice below!</p>
            </div>
          )}

          <AnimatePresence>
            {displayContent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                
                {/* Formulas / Rules / Principles */}
                {displayContent.importantFormulasOrRules?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection('formulas')}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-800/20 transition-colors"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Calculator className="text-emerald-400" size={20} /> 
                        {categoryId === 'numerical' ? 'Important Formulas' : categoryId === 'situational' ? 'Key Principles' : 'Important Rules'}
                      </h3>
                      {openSections.formulas ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>
                    {openSections.formulas && (
                      <ul className="px-5 md:px-6 pb-6 space-y-2">
                        {displayContent.importantFormulasOrRules.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm bg-slate-900/40 rounded-lg p-3 border border-slate-800/50">
                            <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* Key Concepts */}
                {displayContent.keyConcepts?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection('concepts')}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-800/20 transition-colors"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Brain className="text-blue-400" size={20} /> Key Concepts
                      </h3>
                      {openSections.concepts ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>
                    {openSections.concepts && (
                      <ul className="px-5 md:px-6 pb-6 space-y-2">
                        {displayContent.keyConcepts.map((concept, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm bg-slate-900/40 rounded-lg p-3 border border-slate-800/50">
                            <span className="text-blue-400 mt-0.5 shrink-0">•</span>
                            {concept}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* Shortcuts */}
                {displayContent.shortcutsAndTricks?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl border border-amber-500/20 overflow-hidden bg-amber-500/5"
                  >
                    <button
                      onClick={() => toggleSection('shortcuts')}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-amber-500/5 transition-colors"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Zap className="text-amber-400" size={20} /> 
                        {categoryId === 'situational' ? 'Practical Approach' : categoryId === 'analytical' ? 'Reasoning Techniques' : 'Shortcuts & Tricks'}
                      </h3>
                      {openSections.shortcuts ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>
                    {openSections.shortcuts && (
                      <ul className="px-5 md:px-6 pb-6 space-y-3">
                        {displayContent.shortcutsAndTricks.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                            <Zap size={14} className="text-amber-400 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* Common Mistakes */}
                {displayContent.commonMistakes?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl border border-slate-800/60 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection('mistakes')}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-slate-800/20 transition-colors"
                    >
                      <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                        <AlertTriangle className="text-red-400" size={20} /> Common Mistakes
                      </h3>
                      {openSections.mistakes ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>
                    {openSections.mistakes && (
                      <div className="px-5 md:px-6 pb-6 space-y-3">
                        {displayContent.commonMistakes.map((m, idx) => (
                          <div key={idx} className="rounded-xl overflow-hidden border border-slate-800">
                            <div className="flex items-start gap-3 p-3 bg-red-500/5">
                              <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                              <span className="text-sm text-red-300">{m}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Practice Section */}
        <div className="space-y-6 pt-8 border-t border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Practice Questions</h2>
            <p className="text-slate-400">AI-generated questions tailored to this topic. Start from Easy and gradually progress to Hard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { level: 'Easy', color: 'emerald', desc: 'For beginners. Basic concepts, direct formula application, and simple calculations.' },
              { level: 'Medium', color: 'amber', desc: 'Multi-step problems, combined concepts, and moderate time pressure.' },
              { level: 'Hard', color: 'red', desc: 'Advanced preparation. Complex, tricky problems requiring deep understanding.' },
            ].map(({ level, color, desc }) => (
              <div key={level} className={`glass-card p-6 rounded-2xl border border-${color}-500/20 flex flex-col h-full bg-${color}-500/5`}>
                <div className={`flex items-center gap-2 mb-4 text-${color}-400 font-bold text-lg`}>
                  <span className={`w-3 h-3 rounded-full bg-${color}-400 animate-pulse`}></span>
                  {level.toUpperCase()}
                </div>
                <p className="text-sm text-slate-400 mb-6 flex-grow">{desc}</p>
                <button
                  onClick={() => startPractice(level)}
                  className={`w-full py-3 bg-${color}-500/10 hover:bg-${color}-500/20 text-${color}-400 border border-${color}-500/30 rounded-xl font-bold transition-colors`}
                >
                  Practice {level}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Company Practice */}
        <div className="space-y-6 pt-16 mt-8 border-t border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <Building2 className="text-[#2F80FF]" size={28} />
              🏢 Company Practice
            </h2>
            <p className="text-slate-400">Practice questions associated with placement assessments for top companies.</p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-800/60 bg-gradient-to-br from-[#2F80FF]/5 to-transparent">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Target Specific Companies</h3>
                <p className="text-sm text-slate-400 mb-4 max-w-md">
                  Filter by Verified Actual Questions or Company-Style AI Questions to test your readiness.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                  <span>TCS</span> • <span>Infosys</span> • <span>Accenture</span> • <span>Deloitte</span> • <span>Zoho</span>
                </div>
              </div>
              <button
                onClick={startCompanyPractice}
                className="w-full md:w-auto py-4 px-8 bg-white text-black hover:bg-slate-200 font-bold rounded-xl shadow-xl transition-all whitespace-nowrap"
              >
                Practice Company Questions
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
