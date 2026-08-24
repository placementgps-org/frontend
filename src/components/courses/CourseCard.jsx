import React from 'react';
import { ExternalLink, GraduationCap, MapPin, Target, Award, BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800/60 hover:border-[#2F80FF]/40 transition-all flex flex-col h-full group">
      {/* Header: Provider & Difficulty */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <GraduationCap size={16} className="text-[#4FA3FF]" />
          <span className="truncate max-w-[180px]">{course.provider}</span>
        </div>
        {course.difficulty && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty}
          </span>
        )}
      </div>

      {/* Course Title */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-[#4FA3FF] transition-colors">
        {course.courseName}
      </h3>

      {/* Category */}
      <div className="flex items-center gap-2 text-xs text-slate-300 mb-6">
        <MapPin size={14} className="text-slate-500" />
        <span className="truncate">{course.category}</span>
      </div>

      {/* Metadata section */}
      <div className="flex flex-col gap-2 mt-auto mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
        {course.skills && (
          <div className="flex items-start gap-2 text-xs">
            <Target size={14} className="text-purple-400 mt-0.5 shrink-0" />
            <span className="text-slate-300 line-clamp-2"><span className="text-slate-500 mr-1">Skills:</span> {course.skills}</span>
          </div>
        )}
        {course.prerequisites && (
          <div className="flex items-start gap-2 text-xs mt-1">
            <BookOpen size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <span className="text-slate-300 line-clamp-2"><span className="text-slate-500 mr-1">Prerequisites:</span> {course.prerequisites}</span>
          </div>
        )}
        {course.certificateAvailable && (
          <div className="flex items-start gap-2 text-xs mt-1">
            <Award size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <span className="text-slate-300 line-clamp-1"><span className="text-slate-500 mr-1">Certificate:</span> {course.certificateAvailable}</span>
          </div>
        )}
        {!course.skills && !course.prerequisites && !course.certificateAvailable && (
          <div className="text-xs text-slate-500 italic py-1">More details available on provider site</div>
        )}
      </div>

      {/* Action Button */}
      <a 
        href={course.courseLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full py-2.5 px-4 bg-slate-800 hover:bg-[#2F80FF] text-white font-medium rounded-xl text-sm transition-all flex items-center justify-center gap-2 group/btn border border-slate-700 hover:border-[#2F80FF]"
      >
        View Course
        <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
};

export default CourseCard;
