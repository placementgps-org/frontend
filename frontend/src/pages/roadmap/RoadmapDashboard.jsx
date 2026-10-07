import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Target, Trophy, Clock, ChevronRight, Lock, Hammer, Map, ArrowRight } from 'lucide-react';
import RecommendedCourses from '../../components/roadmap/RecommendedCourses';
import { useNavigate } from 'react-router-dom';

export default function RoadmapDashboard({ data, savingTopics, onTopicStatusChange, onChangeCareer }) {
  const navigate = useNavigate();
  const { targetCareerName, targetCareerId, description, overallReadiness, completedCount, totalTopics, stages, isCustom } = data;

  // Find the next recommended topic (first non-completed, non-project topic)
  let nextStep = null;
  for (const stage of stages) {
    for (const topic of stage.topics) {
      if (topic.hours !== 'Project' && topic.status !== 'COMPLETED') {
        nextStep = { ...topic, stageName: stage.title };
        break;
      }
    }
    if (nextStep) break;
  }

  const isFullyComplete = !nextStep;

  const diffColor = (diff) => {
    if (diff === 'Beginner') return 'text-emerald-400';
    if (diff === 'Intermediate') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-white">{targetCareerName}</h1>
              {isCustom && (
                <span className="px-2 py-0.5 text-xs bg-[#9A5BFF]/20 text-purple-300 border border-purple-500/30 rounded-full">
                  Custom AI Roadmap
                </span>
              )}
            </div>
            {description && <p className="text-slate-400 text-sm max-w-xl">{description}</p>}
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => navigate('/career-map/ai-advisor')}
              className="px-4 py-2 bg-[#9A5BFF]/10 hover:bg-[#9A5BFF]/20 text-purple-300 rounded-xl text-sm font-medium transition-colors border border-purple-500/30 flex items-center gap-2"
            >
              Ask AI
            </button>
            <button
              onClick={onChangeCareer}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Map size={16} /> Change Career
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── STATS ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-4 mb-8">
        {/* Overall Readiness */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/60 flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke={overallReadiness >= 80 ? '#10b981' : '#2F80FF'}
                strokeWidth="3"
                strokeDasharray={`${overallReadiness} ${100 - overallReadiness}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">{overallReadiness}%</span>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Placement Readiness</p>
            <p className="text-white font-bold text-lg">{overallReadiness}%</p>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/60">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-yellow-400" size={20} />
            <p className="text-slate-400 text-xs">Topics Completed</p>
          </div>
          <p className="text-2xl font-bold text-white">{completedCount} <span className="text-slate-500 text-base font-normal">/ {totalTopics}</span></p>
        </div>

        {/* Next Step */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/60">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-[#4FA3FF]" size={20} />
            <p className="text-slate-400 text-xs">Next Step</p>
          </div>
          {isFullyComplete ? (
            <p className="text-emerald-400 font-bold text-sm">🎉 Roadmap Completed!</p>
          ) : (
            <p className="text-white font-semibold text-sm line-clamp-2">{nextStep?.title}</p>
          )}
        </div>
      </motion.div>

      {/* ── RECOMMENDED COURSES ── */}
      <RecommendedCourses careerId={targetCareerId} completedCount={completedCount} />

      {/* ── COMPLETION BANNER ── */}
      {isFullyComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-center"
        >
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">Roadmap Completed!</h2>
          <p className="text-slate-300 text-sm">You've mastered all topics in the <strong>{targetCareerName}</strong> roadmap. You're placement-ready!</p>
        </motion.div>
      )}

      {/* ── STAGES ── */}
      <div className="space-y-6">
        {stages.map((stage, sIdx) => {
          const stageComplete = stage.topics
            .filter(t => t.hours !== 'Project')
            .every(t => t.status === 'COMPLETED');

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.06 }}
              className={`glass-card rounded-2xl border overflow-hidden ${stageComplete ? 'border-emerald-500/30' : 'border-slate-800/60'}`}
            >
              {/* Stage Header */}
              <div className={`px-6 py-4 flex items-center justify-between ${stageComplete ? 'bg-emerald-500/10' : 'bg-slate-900/50'}`}>
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full text-sm font-bold flex items-center justify-center ${stageComplete ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {stageComplete ? <CheckCircle2 size={16} /> : sIdx + 1}
                  </span>
                  <h2 className={`font-bold tracking-wider text-sm ${stageComplete ? 'text-emerald-400' : 'text-white'}`}>{stage.title}</h2>
                </div>
                <span className="text-xs text-slate-500">
                  {stage.completedCount} / {stage.totalCount} completed
                </span>
              </div>

              {/* Topics */}
              <div className="divide-y divide-slate-800/60">
                {stage.topics.map(topic => {
                  const isProject = topic.hours === 'Project';
                  const isCompleted = !isProject && topic.status === 'COMPLETED';
                  const isInProgress = !isProject && topic.status === 'IN_PROGRESS';
                  const isSaving = savingTopics.has(topic.id);

                  return (
                    <div key={topic.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        {isProject ? (
                          <div className="mt-1 flex-shrink-0 w-[22px] h-[22px] flex items-center justify-center text-amber-400">
                            <Hammer size={18} />
                          </div>
                        ) : (
                          <button
                            disabled={isSaving}
                            onClick={() => {
                              const newStatus = isCompleted ? 'NOT_STARTED' : 'COMPLETED';
                              onTopicStatusChange(topic.id, newStatus);
                            }}
                            className="mt-1 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {isSaving ? (
                              <div className="w-[22px] h-[22px] rounded-full border-2 border-slate-500 border-t-[#2F80FF] animate-spin" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="text-emerald-500" size={22} />
                            ) : isInProgress ? (
                              <div className="relative w-[22px] h-[22px] flex items-center justify-center">
                                <Circle className="text-[#2F80FF]" size={22} />
                                <div className="absolute w-[10px] h-[10px] bg-[#2F80FF] rounded-full opacity-70" />
                              </div>
                            ) : (
                              <Circle className="text-slate-600 hover:text-slate-400 transition-colors" size={22} />
                            )}
                          </button>
                        )}

                        <div>
                          <h4 className={`font-semibold ${isCompleted ? 'text-slate-400 line-through' : isProject ? 'text-amber-200' : 'text-slate-200'}`}>
                            {topic.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                            <span className={diffColor(topic.diff)}>{topic.diff}</span>
                            <span className="text-slate-600">•</span>
                            {isProject ? (
                              <span className="text-amber-400 font-medium flex items-center gap-1">
                                <Hammer size={11} /> Ongoing Project
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1">
                                <Clock size={11} /> {topic.hours}
                              </span>
                            )}
                            {isInProgress && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-[#4FA3FF] font-medium">In Progress</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="ml-10 sm:ml-0 shrink-0">
                        {isProject ? (
                          <span className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-medium inline-flex items-center gap-1.5">
                            <Hammer size={13} /> Build It!
                          </span>
                        ) : !isCompleted && !isInProgress ? (
                          <button
                            disabled={isSaving}
                            onClick={() => onTopicStatusChange(topic.id, 'IN_PROGRESS')}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Start
                          </button>
                        ) : isInProgress ? (
                          <button
                            disabled={isSaving}
                            onClick={() => onTopicStatusChange(topic.id, 'COMPLETED')}
                            className="px-4 py-2 bg-[#2F80FF]/20 hover:bg-[#2F80FF]/30 text-[#4FA3FF] disabled:opacity-50 disabled:cursor-not-allowed border border-[#2F80FF]/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 size={15} /> Mark Done
                          </button>
                        ) : (
                          <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium inline-flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-12" />
    </div>
  );
}
