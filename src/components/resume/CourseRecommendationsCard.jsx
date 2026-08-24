import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, Sparkles, Compass, CheckCircle2, Flame, ShieldAlert, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CourseRecommendationsCard({ courseRecommendations = [], onEvaluateCourse }) {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');

  if (!courseRecommendations || courseRecommendations.length === 0) return null;

  const highPriority = courseRecommendations.filter(c => c.priority === 'high');
  const recommended = courseRecommendations.filter(c => c.priority === 'recommended');
  const optional = courseRecommendations.filter(c => c.priority === 'optional');

  const filteredCourses = selectedFilter === 'all'
    ? courseRecommendations
    : courseRecommendations.filter(c => c.priority === selectedFilter);

  const getPriorityBadge = (priority) => {
    if (priority === 'high') {
      return { label: '🔴 High Priority — Learn Now', bg: 'bg-red-500/10 text-red-400 border-red-500/30' };
    }
    if (priority === 'recommended') {
      return { label: '🟡 Recommended — Strengthen Profile', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    }
    return { label: '🟢 Optional — Skill Advantage', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  };

  const handleOpenCourse = (url) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 relative w-full"
    >
      {/* Ambient gradient glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#2F80FF]/15 via-[#9A5BFF]/15 to-[#2F80FF]/15 blur-xl opacity-60 pointer-events-none rounded-2xl"></div>

      <div className="relative z-10 glass-card rounded-2xl p-6 sm:p-7 border border-[#2F80FF]/30 overflow-hidden bg-slate-950/80 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#2F80FF]/20 to-[#9A5BFF]/20 rounded-xl border border-[#2F80FF]/30 text-[#4FA3FF] shrink-0">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">Recommended Free Courses for Your Skill Gaps</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2F80FF]/15 text-[#4FA3FF] text-[11px] font-semibold border border-[#2F80FF]/30">
                  {courseRecommendations.length} Curated Courses
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted free courses from our verified catalog to resolve identified resume weaknesses
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/free-courses')}
            className="text-xs font-semibold text-slate-400 hover:text-[#4FA3FF] transition-colors flex items-center gap-1.5 self-start sm:self-auto py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700"
          >
            <Compass size={14} />
            <span>Explore All 140+ Courses</span>
          </button>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-[#2F80FF] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Courses ({courseRecommendations.length})
          </button>

          {highPriority.length > 0 && (
            <button
              onClick={() => setSelectedFilter('high')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'high'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-slate-900 text-red-400 hover:text-red-300 border border-red-500/30'
              }`}
            >
              <span>🔴 High Priority</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px]">
                {highPriority.length}
              </span>
            </button>
          )}

          {recommended.length > 0 && (
            <button
              onClick={() => setSelectedFilter('recommended')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'recommended'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900 text-amber-300 hover:text-amber-200 border border-amber-500/30'
              }`}
            >
              <span>🟡 Recommended</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px]">
                {recommended.length}
              </span>
            </button>
          )}

          {optional.length > 0 && (
            <button
              onClick={() => setSelectedFilter('optional')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'optional'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30'
              }`}
            >
              <span>🟢 Optional</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-[10px]">
                {optional.length}
              </span>
            </button>
          )}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredCourses.map((course, idx) => {
              const priorityInfo = getPriorityBadge(course.priority);

              return (
                <motion.div
                  key={course.courseId || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-slate-900/70 border border-slate-800/80 hover:border-[#2F80FF]/60 rounded-xl p-5 transition-all duration-300 flex flex-col justify-between hover:shadow-[0_0_25px_rgba(47,128,255,0.12)] hover:-translate-y-0.5"
                >
                  <div>
                    {/* Top Row: Provider & Priority */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4FA3FF] bg-[#2F80FF]/10 px-2.5 py-1 rounded-lg border border-[#2F80FF]/20 truncate max-w-[65%]">
                        <BookOpen size={13} className="shrink-0" />
                        <span className="truncate">{course.provider}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityInfo.bg}`}>
                        {course.priority.toUpperCase()}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h4 className="text-white font-bold text-sm mb-2.5 line-clamp-2 group-hover:text-[#4FA3FF] transition-colors leading-snug">
                      {course.courseName}
                    </h4>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-2 mb-3.5 flex-wrap">
                      <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/50">
                        {course.difficulty || 'All Levels'}
                      </span>
                      {course.category && (
                        <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md truncate max-w-[140px] border border-slate-700/50">
                          {course.category.split('/')[0].trim()}
                        </span>
                      )}
                      {course.relatedRole && (
                        <span className="text-[10px] font-medium bg-[#9A5BFF]/10 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/20 truncate max-w-[130px]">
                          {course.relatedRole}
                        </span>
                      )}
                    </div>

                    {/* Why this course? */}
                    {course.reason && (
                      <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 mb-4">
                        <p className="text-xs text-slate-300 italic flex items-start gap-2 leading-relaxed">
                          <Sparkles size={13} className="text-[#9A5BFF] shrink-0 mt-0.5" />
                          <span>"{course.reason}"</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action: Evaluate with AI & Start Free Course */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    {onEvaluateCourse && (
                      <button
                        onClick={() => onEvaluateCourse(course)}
                        className="flex-1 py-2 px-2.5 bg-slate-800/80 hover:bg-[#2F80FF]/20 border border-slate-700 hover:border-[#2F80FF]/50 text-slate-200 hover:text-[#4FA3FF] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        title="Evaluate whether this course matches your profile"
                      >
                        <Sparkles size={12} className="text-[#4FA3FF]" />
                        <span>Evaluate for Me</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenCourse(course.courseLink)}
                      className={`${
                        onEvaluateCourse ? 'flex-1' : 'w-full'
                      } py-2 px-2.5 bg-gradient-to-r from-[#2F80FF]/20 to-[#9A5BFF]/20 hover:from-[#2F80FF]/30 hover:to-[#9A5BFF]/30 border border-[#2F80FF]/40 hover:border-[#2F80FF]/70 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 group-hover:shadow-md`}
                    >
                      <span>Start Course</span>
                      <ExternalLink size={12} className="text-[#4FA3FF] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
