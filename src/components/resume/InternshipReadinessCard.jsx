import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2, Clock, Compass, Sparkles } from 'lucide-react';

export default function InternshipReadinessCard({ internshipReadiness }) {
  if (!internshipReadiness) return null;

  const {
    isReady = false,
    readinessLevel = 'Moderate',
    suitableDomains = [],
    recommendedInternshipTypes = [],
    prerequisiteSkillsToBuild = [],
    summary = ''
  } = internshipReadiness;

  const getBadgeStyle = (level) => {
    if (level === 'High' || level === 'Ready') {
      return { label: '🟢 High Internship Readiness', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
    }
    if (level === 'Moderate') {
      return { label: '🟡 Moderate Internship Readiness', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
    }
    return { label: '🟠 Needs Project Preparation', style: 'bg-orange-500/10 text-orange-400 border-orange-500/30' };
  };

  const badge = getBadgeStyle(readinessLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-800/80 bg-slate-950/70 mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-xl border border-teal-500/30 text-teal-400 shrink-0">
            <Briefcase size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Internship Readiness & Entry Opportunities</h3>
            <p className="text-xs text-slate-400">Domain matching and prerequisites for undergraduate internships</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.style} self-start sm:self-auto`}>
          {badge.label}
        </span>
      </div>

      {summary && (
        <p className="text-xs text-slate-300 leading-relaxed mb-6 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          💡 <strong className="text-white">Internship Guidance:</strong> {summary}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Suitable Domains */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider mb-3">
            <Compass size={15} className="text-[#4FA3FF]" />
            <span>Target Domains</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suitableDomains.map((dom, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#2F80FF]/10 text-[#4FA3FF] text-xs font-medium border border-[#2F80FF]/20">
                {dom}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Internship Titles */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider mb-3">
            <Sparkles size={15} className="text-emerald-400" />
            <span>Recommended Roles</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recommendedInternshipTypes.map((type, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-medium border border-emerald-500/20">
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Prerequisites to Build */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider mb-3">
            <Clock size={15} className="text-amber-400" />
            <span>Prerequisites to Complete</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {prerequisiteSkillsToBuild.map((skill, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 text-xs font-medium border border-amber-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
