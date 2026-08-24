import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { aptitudeService } from '../../services/aptitudeService';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await aptitudeService.getCategoryTopics(categoryId);
        if (data.success) {
          // Sort topics by priority
          const sortedTopics = data.topics.sort((a, b) => a.priority - b.priority);
          setTopics(sortedTopics);
          
          // Try to get category name from categories API
          const catData = await aptitudeService.getCategories();
          if (catData.success) {
            const cat = catData.categories.find(c => c.id === categoryId);
            if (cat) setCategoryName(cat.name);
          }
        } else {
          setError('Failed to fetch topics');
        }
      } catch (err) {
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />
      
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Back Button & Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/practice')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-6"
          >
            <ArrowLeft size={16} />
            Back to Categories
          </button>
          
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3"
          >
            {categoryName || 'Practice Topics'}
            <span className="text-sm font-medium px-3 py-1 bg-slate-800 rounded-full text-slate-300 ml-2 border border-slate-700">
              {topics.length} Topics
            </span>
          </motion.h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-[#2F80FF] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center text-red-400">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic, index) => {
              const { progressPercentage, totalAttempts, correctAnswers } = topic.progress;
              const isStarted = totalAttempts > 0;
              const isCompleted = progressPercentage >= 80 && totalAttempts >= 10; // Simple threshold logic

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => navigate(`/practice/${categoryId}/${topic.id}`)}
                  className="glass-card rounded-xl p-5 border border-slate-800/60 hover:border-[#2F80FF]/40 cursor-pointer group transition-all duration-300 flex items-center bg-slate-900/40 hover:bg-slate-900/80"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-slate-500 w-5">
                        {topic.priority}.
                      </span>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#4FA3FF] transition-colors">
                        {topic.name}
                      </h3>
                      {isCompleted && (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs pl-8">
                      {isStarted ? (
                        <>
                          <span className="text-slate-400">
                            Progress: <span className="font-semibold text-white">{progressPercentage}%</span>
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-emerald-400">
                            {correctAnswers}/{totalAttempts} Correct
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-500">Not started yet</span>
                      )}
                    </div>
                  </div>

                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isStarted ? 'bg-[#2F80FF]/10 text-[#4FA3FF]' : 'bg-slate-800 text-slate-400'
                  } group-hover:bg-[#2F80FF] group-hover:text-white`}>
                    <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
