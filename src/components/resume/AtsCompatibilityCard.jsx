import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function AtsCompatibilityCard({ atsCompatibility }) {
  if (!atsCompatibility) return null;

  const {
    score = 0,
    goodPractices = [],
    potentialIssues = [],
    improvements = []
  } = atsCompatibility;

  const getStatus = (s) => {
    if (s >= 80) return { label: 'High ATS Compatibility', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (s >= 65) return { label: 'Moderate ATS Compatibility', color: 'text-[#4FA3FF] bg-[#2F80FF]/10 border-[#2F80FF]/20' };
    return { label: 'Needs Formatting Optimization', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  };

  const statusInfo = getStatus(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-800/80 bg-slate-950/70 mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 text-indigo-400 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">ATS Compatibility & Recruiter Screening</h3>
            <p className="text-xs text-slate-400">Automated Applicant Tracking System parseability evaluation</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className="text-lg font-bold text-white px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800">
            {score}<span className="text-xs text-slate-500">/100</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* What is Good */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-3">
            <CheckCircle2 size={15} />
            <span>What Works Well</span>
          </div>
          {goodPractices && goodPractices.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300 flex-1">
              {goodPractices.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Standard structure detected.</p>
          )}
        </div>

        {/* Potential Issues */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-3">
            <AlertTriangle size={15} />
            <span>Potential ATS Pitfalls</span>
          </div>
          {potentialIssues && potentialIssues.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300 flex-1">
              {potentialIssues.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">No critical ATS parseability traps found.</p>
          )}
        </div>

        {/* Actionable Fixes */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
          <div className="flex items-center gap-2 text-[#4FA3FF] font-semibold text-xs uppercase tracking-wider mb-3">
            <ArrowUpRight size={15} />
            <span>Recommended ATS Actions</span>
          </div>
          {improvements && improvements.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300 flex-1">
              {improvements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F80FF] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Formatting meets current ATS screening norms.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
