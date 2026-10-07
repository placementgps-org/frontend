import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProfileEvaluationCard({ profileEvaluation }) {
  if (!profileEvaluation) return null;

  const {
    education = {},
    certifications = {},
    experience = {}
  } = profileEvaluation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-800/80 bg-slate-950/70 mb-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-800/60">
        <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30 text-amber-400 shrink-0">
          <GraduationCap size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Education, Certifications & Work Experience</h3>
          <p className="text-xs text-slate-400">Academic credentials and professional background evaluation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Education */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider mb-2.5">
              <GraduationCap size={16} className="text-[#4FA3FF]" />
              <span>Education Background</span>
            </div>
            <p className="text-sm font-semibold text-white mb-1.5">{education.degree || 'Degree Information'}</p>
            {education.relevance && (
              <span className="inline-block px-2 py-0.5 rounded bg-[#2F80FF]/10 text-[#4FA3FF] text-[11px] font-medium border border-[#2F80FF]/20 mb-2">
                {education.relevance}
              </span>
            )}
            <p className="text-xs text-slate-300 leading-relaxed">{education.feedback}</p>
          </div>
        </div>

        {/* Certifications */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider mb-2.5">
              <Award size={16} className="text-amber-400" />
              <span>Certifications</span>
            </div>

            {certifications.detected && certifications.detected.length > 0 ? (
              <div className="space-y-1.5 mb-2.5">
                {certifications.detected.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-200">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-2.5 italic">No formal certifications listed.</p>
            )}

            {certifications.missingRecommendations && certifications.missingRecommendations.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Recommended Areas:</span>
                <span>{certifications.missingRecommendations.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Experience / Internships */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider mb-2.5">
              <Briefcase size={16} className="text-emerald-400" />
              <span>Internships & Experience</span>
            </div>

            {experience.internships && experience.internships.length > 0 ? (
              <div className="space-y-1.5 mb-2.5">
                {experience.internships.map((exp, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-200">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-2.5 italic">No corporate work experience listed.</p>
            )}

            <p className="text-xs text-slate-300 leading-relaxed">{experience.qualityFeedback}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
