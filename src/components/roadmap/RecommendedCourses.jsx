import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, Sparkles, Loader2, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { roadmapService } from '../../services/roadmapService';
import { useNavigate } from 'react-router-dom';

export default function RecommendedCourses({ careerId, stageId, completedCount }) {
  const [courses, setCourses] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRecommendations = useCallback(async () => {
    if (!careerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await roadmapService.getRecommendedCourses();
      if (res && res.success && Array.isArray(res.data)) {
        setCourses(res.data);
        if (res.activeStage) {
          setActiveStage(res.activeStage);
        }
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.warn('[RecommendedCourses] Fetch error:', err);
      setError('Unable to load course recommendations right now.');
    } finally {
      setLoading(false);
    }
  }, [careerId, completedCount, stageId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleOpenCourse = (courseLink) => {
    if (courseLink && courseLink.startsWith('http')) {
      window.open(courseLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="mb-8 relative w-full">
      {/* Decorative ambient gradient */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#2F80FF]/15 via-[#9A5BFF]/15 to-[#2F80FF]/15 blur-xl opacity-60 pointer-events-none rounded-2xl"></div>

      <div className="relative z-10 glass-card rounded-2xl p-6 sm:p-7 border border-[#2F80FF]/30 overflow-hidden bg-slate-950/80 backdrop-blur-md">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#2F80FF]/20 to-[#9A5BFF]/20 rounded-xl border border-[#2F80FF]/30 text-[#4FA3FF] shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">Recommended For You</h3>
                {activeStage?.title && (
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#2F80FF]/15 text-[#4FA3FF] border border-[#2F80FF]/30">
                    Stage: {activeStage.title}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-curated free courses to master your current roadmap stage
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/free-courses')}
            className="text-xs font-medium text-slate-400 hover:text-[#4FA3FF] transition-colors flex items-center gap-1.5 self-start sm:self-auto py-1 px-2.5 rounded-lg hover:bg-slate-800/50"
          >
            <Compass size={14} />
            <span>Explore All 140+ Free Courses</span>
          </button>
        </div>

        {/* ── 1. LOADING STATE ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center">
            <Loader2 className="w-8 h-8 text-[#2F80FF] animate-spin mb-3" />
            <p className="text-slate-300 text-sm font-medium">Finding the perfect courses for your current stage...</p>
            <p className="text-slate-500 text-xs mt-1">Analyzing career requirements and database records</p>
          </div>
        )}

        {/* ── 2. ERROR STATE ── */}
        {!loading && error && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchRecommendations}
                className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} />
                Retry
              </button>
              <button
                onClick={() => navigate('/free-courses')}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          </div>
        )}

        {/* ── 3. EMPTY STATE ── */}
        {!loading && !error && courses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 px-4 rounded-xl bg-slate-900/40 border border-slate-800/50 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <BookOpen size={20} />
            </div>
            <h4 className="text-slate-200 font-semibold text-sm">No matching courses for this specific stage yet</h4>
            <p className="text-slate-400 text-xs max-w-md mt-1 mb-4">
              You can explore our complete directory of 140+ free certification courses across various skills and domains.
            </p>
            <button
              onClick={() => navigate('/free-courses')}
              className="px-4 py-2 bg-[#2F80FF]/20 hover:bg-[#2F80FF]/30 border border-[#2F80FF]/40 text-[#4FA3FF] rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Compass size={15} />
              Browse All Free Courses
            </button>
          </div>
        )}

        {/* ── 4. SUCCESS STATE (COURSE GRID) ── */}
        {!loading && !error && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {courses.map((course, idx) => (
                <motion.div
                  key={course.courseId || course._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-slate-900/70 border border-slate-800/80 hover:border-[#2F80FF]/60 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_25px_rgba(47,128,255,0.12)] hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Row: Provider & Match Score */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4FA3FF] bg-[#2F80FF]/10 px-2.5 py-1 rounded-lg border border-[#2F80FF]/20 truncate max-w-[70%]">
                        <BookOpen size={13} className="shrink-0" />
                        <span className="truncate">{course.provider}</span>
                      </div>
                      {typeof course.relevanceScore === 'number' && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {course.relevanceScore}% Match
                        </span>
                      )}
                    </div>

                    {/* Course Title */}
                    <h4 className="text-white font-bold text-sm mb-2.5 line-clamp-2 group-hover:text-[#4FA3FF] transition-colors leading-snug">
                      {course.courseName}
                    </h4>

                    {/* Badges: Difficulty & Category */}
                    <div className="flex items-center gap-2 mb-3.5 flex-wrap">
                      <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50">
                        {course.difficulty || 'All Levels'}
                      </span>
                      {course.category && (
                        <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md truncate max-w-[170px] border border-slate-700/50">
                          {course.category.split('/')[0].trim()}
                        </span>
                      )}
                    </div>

                    {/* AI / Curated Explanation */}
                    {course.aiExplanation && (
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-4">
                        <p className="text-xs text-slate-300 italic flex items-start gap-2 leading-relaxed">
                          <Sparkles size={13} className="text-[#9A5BFF] shrink-0 mt-0.5" />
                          <span>"{course.aiExplanation}"</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action: Start Course Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleOpenCourse(course.courseLink)}
                      className="w-full py-2 px-3.5 bg-gradient-to-r from-[#2F80FF]/20 to-[#9A5BFF]/20 hover:from-[#2F80FF]/30 hover:to-[#9A5BFF]/30 border border-[#2F80FF]/40 hover:border-[#2F80FF]/70 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 group-hover:shadow-md"
                    >
                      <span>Start Free Course</span>
                      <ExternalLink size={13} className="text-[#4FA3FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
