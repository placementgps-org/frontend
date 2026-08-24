import React from 'react';
import { motion } from 'framer-motion';
import { Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuitableRolesCard({ suitableRoles = [] }) {
  const navigate = useNavigate();
  if (!suitableRoles || suitableRoles.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-800/80 bg-slate-950/70 mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-blue-500/30 text-[#4FA3FF] shrink-0">
            <Target size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Roles You Can Apply For</h3>
            <p className="text-xs text-slate-400">AI-matched target job profiles based on your verified skills & projects</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/roadmap')}
          className="text-xs font-semibold text-[#4FA3FF] hover:text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto py-1 px-3 rounded-lg bg-[#2F80FF]/10 border border-[#2F80FF]/30 hover:bg-[#2F80FF]/20"
        >
          <span>View Career Roadmaps</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suitableRoles.map((roleItem, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-[#2F80FF]/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Role & Match percentage */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <h4 className="text-white font-bold text-sm leading-snug">{roleItem.role}</h4>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {roleItem.matchPercentage}% Match
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2F80FF] to-emerald-400 transition-all duration-500"
                  style={{ width: `${roleItem.matchPercentage}%` }}
                />
              </div>

              {/* Why you match */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {roleItem.reason}
              </p>
            </div>

            {/* Missing skills */}
            {roleItem.missingSkills && roleItem.missingSkills.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Missing Skills to Maximize Shortlisting:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {roleItem.missingSkills.map((ms, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 text-[10px] font-medium border border-red-500/20"
                    >
                      {ms}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
