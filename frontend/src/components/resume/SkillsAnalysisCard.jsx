import React from 'react';
import { motion } from 'framer-motion';
import { Code, CheckCircle2, AlertCircle, Sparkles, PlusCircle, Rocket } from 'lucide-react';

export default function SkillsAnalysisCard({ skillsAnalysis }) {
  if (!skillsAnalysis) return null;

  const {
    score = 0,
    detected = [],
    strong = [],
    weakOrInsufficient = [],
    missingForTargetRoles = [],
    employabilityBoosters = [],
    explanation = ''
  } = skillsAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-800/80 bg-slate-950/70 mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30 text-emerald-400 shrink-0">
            <Code size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Skills Matrix & Capability Depth</h3>
            <p className="text-xs text-slate-400">Technical proficiency, domain coverage, and gaps</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Skills Score:</span>
          <span className="text-lg font-bold text-emerald-400 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            {score}/100
          </span>
        </div>
      </div>

      {explanation && (
        <p className="text-xs text-slate-300 leading-relaxed mb-6 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          💡 <strong className="text-white">AI Evaluation:</strong> {explanation}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Skills */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 size={15} />
            <span>Strong / Demonstrated Skills</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {strong && strong.length > 0 ? (
              strong.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">None clearly validated with projects.</span>
            )}
          </div>
        </div>

        {/* Missing for Target Roles */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertCircle size={15} />
            <span>Missing for Target Roles</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {missingForTargetRoles && missingForTargetRoles.length > 0 ? (
              missingForTargetRoles.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No critical missing skill gaps found.</span>
            )}
          </div>
        </div>

        {/* Weak / Insufficiently Demonstrated */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <PlusCircle size={15} />
            <span>Listed but Needs Evidence / Projects</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {weakOrInsufficient && weakOrInsufficient.length > 0 ? (
              weakOrInsufficient.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">All listed skills have corresponding proof.</span>
            )}
          </div>
        </div>

        {/* Employability Boosters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#4FA3FF] text-xs font-bold uppercase tracking-wider">
            <Rocket size={15} />
            <span>High-Demand Employability Boosters</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {employabilityBoosters && employabilityBoosters.length > 0 ? (
              employabilityBoosters.map((s, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-[#2F80FF]/10 border border-[#2F80FF]/30 text-[#4FA3FF] text-xs font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F80FF]" />
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No specific boosters needed.</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
