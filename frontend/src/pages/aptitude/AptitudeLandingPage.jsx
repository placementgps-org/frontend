import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calculator,
  Brain,
  BookOpen,
  Users,
  Lightbulb,
  Code2,
  Activity,
  ChevronRight,
  Terminal,
  Sparkles
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { aptitudeService } from '../../services/aptitudeService';
import { codingService } from '../../services/codingService';

const iconMap = {
  Calculator,
  Brain,
  BookOpen,
  Users,
  Lightbulb,
  Code2,
  Terminal
};

export default function AptitudeLandingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [codingProgress, setCodingProgress] = useState({
    totalSolved: 0,
    totalAttempted: 0,
    programmingSolved: 0,
    dsaSolved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, codeData] = await Promise.allSettled([
          aptitudeService.getCategories(),
          codingService.getProgress()
        ]);

        if (catData.status === 'fulfilled' && catData.value.success) {
          setCategories(catData.value.categories);
        } else {
          setError('Failed to fetch categories');
        }

        if (codeData.status === 'fulfilled' && codeData.value.success) {
          setCodingProgress(codeData.value.data);
        }
      } catch (err) {
        console.error('Error fetching practice data:', err);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute coding progress percentage (scaled to 10 milestone challenges)
  const codingTotalAttempted = codingProgress.totalAttempted || 0;
  const codingTotalSolved = codingProgress.totalSolved || 0;
  const codingPercentage = codingTotalAttempted > 0
    ? Math.min(100, Math.round((codingTotalSolved / Math.max(codingTotalAttempted, 1)) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight gradient-heading">
            Aptitude & Coding Practice
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl">
            Master the most critical aptitude and programming skills tested by top product-based and service-based companies. Choose a category below to begin your practice.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-[#2F80FF] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center text-red-400">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1 to 5: Existing Aptitude Categories */}
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon] || Calculator;
              const { progressPercentage = 0, totalAttempts = 0, correctAnswers = 0 } = category.progress || {};

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="glass-card rounded-2xl p-6 border border-slate-800/60 hover:border-[#2F80FF]/40 transition-all group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F80FF]/20 to-[#1D5BD8]/20 flex items-center justify-center border border-[#2F80FF]/30 group-hover:scale-110 transition-transform">
                      <IconComponent className="text-[#4FA3FF]" size={24} />
                    </div>
                    <span className="text-xs font-medium px-3 py-1 bg-slate-800 rounded-full text-slate-300">
                      {category.topicsCount} Topics
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2">{category.name}</h2>
                  <p className="text-sm text-slate-400 mb-6 flex-grow">{category.description}</p>

                  <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-800/50">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                        <Activity size={14} className="text-[#4FA3FF]" />
                        Progress
                      </span>
                      <span className="text-sm font-bold text-white">{progressPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#2F80FF] to-[#1D5BD8]"
                      ></motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{totalAttempts} Attempted</span>
                      <span className="text-emerald-400">{correctAnswers} Correct</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/practice/${category.id}`)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#2F80FF] to-[#1D5BD8] hover:from-[#3B8BFF] hover:to-[#2868E6] text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                  >
                    {totalAttempts > 0 ? 'Continue Practice' : 'Start Practice'}
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              );
            })}

            {/* 6th Card: 💻 Coding Practice (Row 2, Column 3 - directly beside Analytical & Critical Thinking) */}
            <motion.div
              key="coding-practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 5 * 0.08 }}
              className="glass-card rounded-2xl p-6 border border-[#2F80FF]/40 bg-gradient-to-b from-[#2F80FF]/5 via-slate-900/40 to-slate-950/80 hover:border-[#2F80FF]/80 transition-all group flex flex-col h-full shadow-[0_0_30px_rgba(47,128,255,0.08)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F80FF]/30 to-[#9A5BFF]/30 flex items-center justify-center border border-[#2F80FF]/40 group-hover:scale-110 transition-transform">
                  <Code2 className="text-[#4FA3FF]" size={24} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-[#2F80FF]/20 text-[#4FA3FF] rounded-full border border-[#2F80FF]/30 flex items-center gap-1">
                    <Sparkles size={12} />
                    AI Powered
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold text-white">Coding Practice</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#4FA3FF] font-medium mb-2">
                <span>Programming + DSA</span>
                <span>•</span>
                <span className="text-slate-400">Easy → Medium → Hard</span>
              </div>

              <p className="text-sm text-slate-400 mb-6 flex-grow">
                Practice Programming and DSA through AI-generated coding challenges.
              </p>

              <div className="bg-slate-900/60 rounded-xl p-4 mb-6 border border-[#2F80FF]/20">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Activity size={14} className="text-[#4FA3FF]" />
                    Solve Progress
                  </span>
                  <span className="text-sm font-bold text-white">{codingPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${codingPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-[#2F80FF] to-[#9A5BFF]"
                  ></motion.div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{codingTotalAttempted} Attempted</span>
                  <span className="text-emerald-400">{codingTotalSolved} Solved</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/coding-practice')}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#2F80FF] to-[#9A5BFF] hover:from-[#3B8BFF] hover:to-[#A870FF] text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 group/btn shadow-md cursor-pointer"
              >
                <span>{codingTotalAttempted > 0 ? 'Continue Coding' : 'Start Coding'}</span>
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
