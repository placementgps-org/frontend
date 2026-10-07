import React from 'react';
import { motion } from 'framer-motion';
import { Layers, AlertTriangle, CheckCircle2, Code2, ExternalLink, Hammer, Lightbulb } from 'lucide-react';

export default function ProjectsAnalysisCard({ projectsAnalysis }) {
  if (!projectsAnalysis) return null;

  const {
    score = 0,
    projectCount = 0,
    hasProjects = false,
    detectedProjects = [],
    technicalDepthFeedback = '',
    measurableOutcomesFeedback = '',
    explanation = ''
  } = projectsAnalysis;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 sm:p-7 border border-slate-800/80 bg-slate-950/70 mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30 text-cyan-400 shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-white">Project Evaluation & Practical Proof</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                {projectCount} {projectCount === 1 ? 'Project' : 'Projects'} Found
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Architecture depth, technology stack, and measurable impact</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Projects Score:</span>
          <span className={`text-lg font-bold px-2.5 py-0.5 rounded-lg border ${
            score >= 70
              ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
          }`}>
            {score}/100
          </span>
        </div>
      </div>

      {/* ── SPECIAL ALERT: NO PROJECTS DETECTED ── */}
      {!hasProjects && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-amber-300 mb-1">No Practical Projects Detected</h4>
            <p className="text-slate-300 leading-relaxed">
              Your resume currently does not demonstrate any practical software or engineering projects. For technical campus placements, having at least 2–3 completed projects with live links or GitHub repositories is critical for passing initial recruiter shortlists.
            </p>
          </div>
        </div>
      )}

      {/* Explanation Banner */}
      {explanation && (
        <p className="text-xs text-slate-300 leading-relaxed mb-6 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          💡 <strong className="text-white">Review Summary:</strong> {explanation}
        </p>
      )}

      {/* Detected Projects List */}
      {detectedProjects && detectedProjects.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Projects:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedProjects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h5 className="text-white font-bold text-sm">{proj.name || `Project #${idx + 1}`}</h5>
                    <Hammer size={14} className="text-cyan-400" />
                  </div>

                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {proj.technologies.map((tech, tIdx) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 mb-3">{proj.feedback}</p>
                </div>

                {proj.missingElements && proj.missingElements.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-800/80 text-[11px] text-amber-300 flex items-center gap-1.5">
                    <Lightbulb size={12} className="shrink-0 text-amber-400" />
                    <span>Missing: {proj.missingElements.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Depth & Outcomes feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Technical Architecture Depth
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {technicalDepthFeedback || 'Ensure projects demonstrate end-to-end data flow and error handling.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Measurable Achievements & Metrics
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {measurableOutcomesFeedback || 'Quantify your contributions with metrics, throughput, or user engagement numbers.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
