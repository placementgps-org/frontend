import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, CheckCircle2, ShieldCheck, Code, Layers, FileCheck } from 'lucide-react';

export default function ScoreOverviewCards({ analysis }) {
  if (!analysis) return null;

  const {
    overallScore = 0,
    atsScore = 0,
    skillsScore = 0,
    projectsScore = 0,
    overallImpression = '',
    strengths = []
  } = analysis;

  const getScoreColor = (score) => {
    if (score >= 80) return { stroke: '#10b981', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    if (score >= 65) return { stroke: '#2F80FF', text: 'text-[#4FA3FF]', badge: 'bg-[#2F80FF]/10 text-[#4FA3FF] border-[#2F80FF]/20' };
    return { stroke: '#f59e0b', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  };

  const scores = [
    { title: 'Overall Score', score: overallScore, icon: Award, subtitle: 'Placement Readiness', delay: 0.05 },
    { title: 'ATS Compatibility', score: atsScore, icon: ShieldCheck, subtitle: 'Recruiter Screening', delay: 0.1 },
    { title: 'Skills Score', score: skillsScore, icon: Code, subtitle: 'Technical & Soft Skills', delay: 0.15 },
    { title: 'Projects Score', score: projectsScore, icon: Layers, subtitle: 'Practical Proof & Depth', delay: 0.2 },
  ];

  return (
    <div className="w-full mb-8">
      {/* ── 4 CIRCULAR SCORE METERS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scores.map((item, idx) => {
          const colorInfo = getScoreColor(item.score);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-950/70 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-medium">{item.title}</span>
                <Icon size={16} className={colorInfo.text} />
              </div>

              <div className="flex items-center gap-4 my-2">
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3.2" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke={colorInfo.stroke}
                      strokeWidth="3.2"
                      strokeDasharray={`${item.score} ${100 - item.score}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${colorInfo.text}`}>
                    {item.score}%
                  </span>
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-tight">{item.score}<span className="text-xs text-slate-500">/100</span></p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── OVERALL IMPRESSION & STRENGTHS BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-6 sm:p-7 border border-[#2F80FF]/30 bg-gradient-to-br from-slate-950/90 via-[#2F80FF]/5 to-slate-950/90 relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9A5BFF]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-[#2F80FF]/20 to-[#9A5BFF]/20 rounded-xl border border-[#2F80FF]/30 text-[#4FA3FF] shrink-0 mt-0.5">
            <Sparkles size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h3 className="text-lg font-bold text-white">Overall Resume Impression</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#2F80FF]/15 text-[#4FA3FF] text-[11px] font-semibold border border-[#2F80FF]/30">
                AI Executive Summary
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              "{overallImpression}"
            </p>

            {strengths && strengths.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Key Strengths Identified:</p>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((str, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium"
                    >
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      {str}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
