import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, FileText, Code, Hammer, ShieldCheck, Target } from 'lucide-react';

export default function ThingsToImproveCard({ thingsToImprove }) {
  const [activeCategory, setActiveCategory] = useState('content');

  if (!thingsToImprove) return null;

  const {
    resumeContent = [],
    technicalProfile = [],
    projects = [],
    atsOptimization = [],
    careerReadiness = []
  } = thingsToImprove;

  const categories = [
    { key: 'content', title: 'Resume Content', icon: FileText, color: 'text-[#4FA3FF]', border: 'border-[#2F80FF]/30', bg: 'bg-[#2F80FF]/10', items: resumeContent },
    { key: 'tech', title: 'Technical Profile', icon: Code, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', items: technicalProfile },
    { key: 'projects', title: 'Projects & GitHub', icon: Hammer, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', items: projects },
    { key: 'ats', title: 'ATS Optimization', icon: ShieldCheck, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', items: atsOptimization },
    { key: 'career', title: 'Career Readiness', icon: Target, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', items: careerReadiness },
  ].filter(c => c.items && c.items.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-800/80 bg-slate-950/70 mb-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-800/60">
        <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-xl border border-amber-500/30 text-amber-400 shrink-0">
          <ArrowUpRight size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Actionable Things To Improve</h3>
          <p className="text-xs text-slate-400">High-impact modifications to elevate your resume and interview shortlisting</p>
        </div>
      </div>

      {/* Category Pills / Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                isActive
                  ? `${cat.bg} ${cat.color} ${cat.border} border shadow-sm`
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon size={14} className={isActive ? cat.color : 'text-slate-500'} />
              <span>{cat.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                {cat.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {categories
          .find((c) => c.key === activeCategory)
          ?.items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-slate-800 text-[#4FA3FF] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed flex-1">{item}</p>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
