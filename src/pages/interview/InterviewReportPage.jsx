import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  History,
  TrendingUp,
  FileText,
  Volume2,
  Eye,
  User,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Loader2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { interviewService } from '../../services/interviewService';
import { getInterviewerById } from '../../config/avatarConfig';

export default function InterviewReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await interviewService.getSession(sessionId);
        if (data.success && data.session) {
          setSession(data.session);
        } else {
          setError('Could not locate interview report.');
        }
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setError('Failed to load interview report.');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070F] text-white flex flex-col items-center justify-center">
        <Loader2 size={40} className="text-[#4FA3FF] animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading interview evaluation...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#05070F] text-white flex flex-col justify-between">
        <Navbar onOpenLogin={() => {}} isAuthPage />
        <main className="flex-grow pt-32 pb-16 px-4 max-w-lg mx-auto text-center">
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-6">
            {error || 'Interview session not found.'}
          </div>
          <button
            onClick={() => navigate('/interview-practice')}
            className="px-6 py-3 rounded-xl bg-[#2F80FF] text-white font-bold text-sm cursor-pointer"
          >
            Back to Interview Practice
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const evalData = session.evaluation || {};
  const overallScore = evalData.overallScore || 0;
  const categoryScores = evalData.categoryScores || {};
  const categoryExplanations = evalData.categoryExplanations || {};
  const strengths = evalData.strengths || [];
  const areasToImprove = evalData.areasToImprove || [];
  const personalizedPlan = evalData.personalizedPlan || [];
  const evidenceObservations = evalData.evidenceObservations || [];

  const interviewer = getInterviewerById(session.interviewerId);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-[#4FA3FF] border-blue-500/30 bg-blue-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  const getScoreBadge = (score) => {
    if (score >= 85) return { label: 'Placement Ready', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (score >= 70) return { label: 'Promising Fit', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    return { label: 'Needs Dedicated Practice', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  };

  const badgeInfo = getScoreBadge(overallScore);

  const categories = [
    { key: 'communication', label: 'Communication & Structure', icon: MessageSquare },
    { key: 'answerQuality', label: 'Answer Quality & Depth', icon: FileText },
    { key: 'professionalism', label: 'Professionalism & Tone', icon: ShieldCheck },
    { key: 'relevance', label: 'Relevance & Focus', icon: CheckCircle2 },
    { key: 'voiceDelivery', label: 'Voice & Delivery', icon: Volume2 },
    { key: 'eyeContact', label: 'Eye Contact & Focus', icon: Eye },
    { key: 'bodyLanguage', label: 'Body Language & Posture', icon: User },
    { key: 'interviewBehavior', label: 'Interview Behavior', icon: Sparkles },
    { key: 'followUpHandling', label: 'Follow-up Question Handling', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-[#4FA3FF] text-xs font-semibold uppercase tracking-wider mb-2">
              <Award size={14} /> Official Performance Scorecard
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-heading">
              Interview Evaluation Report
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Mode: <span className="capitalize text-white font-medium">{session.mode}</span> • Track: <span className="capitalize text-white font-medium">{session.interviewType}</span> • Interviewer: <span className="text-white font-medium">{interviewer.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/interview-practice/history')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <History size={14} className="text-[#4FA3FF]" />
              View History
            </button>
            <button
              onClick={() => navigate('/interview-practice')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2F80FF] hover:bg-[#1D5BD8] transition-colors cursor-pointer shadow-md shadow-[#2F80FF]/25"
            >
              <RotateCcw size={14} />
              Practice Another
            </button>
          </div>
        </motion.div>

        {/* Top Highlight: Overall Score Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 mb-8 bg-gradient-to-r from-[#0F172A]/95 via-[#0B1120]/90 to-[#0F172A]/95"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Score Ring */}
            <div className="flex items-center gap-6 md:border-r border-slate-800/80 pr-6">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 flex flex-col items-center justify-center shadow-lg ${getScoreColor(overallScore)}`}>
                <span className="text-3xl sm:text-4xl font-black">{overallScore}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mt-0.5">/ 100</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Overall Readiness
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badgeInfo.color} mb-2`}>
                  {badgeInfo.label}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Composite score evaluated across technical depth, verbal composure, and delivery.
                </p>
              </div>
            </div>

            {/* Quick Metrics Summary */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">Turns Completed</span>
                <span className="text-xl font-bold text-white">
                  {session.transcript?.filter(t => t.speaker === 'student').length || 0} Answers
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">Spoken / Typed Pace</span>
                <span className="text-xl font-bold text-[#4FA3FF]">
                  {session.speechMetrics?.avgWpm ? `${session.speechMetrics.avgWpm} WPM` : 'Steady & Natural'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400 block mb-1 font-medium">Camera Attention</span>
                <span className="text-xl font-bold text-emerald-400">
                  {session.visualMetrics?.isEvaluated ? `${session.visualMetrics.cameraAttentionPercent}%` : 'Not Evaluated'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 9 Category Scorecards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[#4FA3FF]" /> Core Evaluation Dimensions (9 Dimensions)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const score = categoryScores[cat.key];
              const explanation = categoryExplanations[cat.key];
              const isEvaluated = typeof score === 'number' && score > 0;
              const Icon = cat.icon;

              return (
                <div key={cat.key} className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[#4FA3FF]">
                        <Icon size={16} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        isEvaluated ? getScoreColor(score) : 'bg-slate-800/50 text-slate-500 border-slate-800'
                      }`}>
                        {isEvaluated ? `${score} / 100` : 'Not Evaluated'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">{cat.label}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {explanation || (isEvaluated ? 'Demonstrated strong aptitude in this dimension.' : 'Evaluated in speaking mode with active camera/microphone.')}
                    </p>
                  </div>

                  {isEvaluated && (
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-4">
                      <div
                        className="h-full bg-gradient-to-r from-[#2F80FF] to-cyan-400 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Strengths & Areas to Improve Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Strengths Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-950/40">
            <h2 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} /> Candidate Strengths
            </h2>
            <ul className="space-y-3.5">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-relaxed">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Improve Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 bg-slate-950/40">
            <h2 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} /> Areas for Improvement
            </h2>
            <ul className="space-y-3.5">
              {areasToImprove.map((area, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    !
                  </span>
                  <span className="leading-relaxed">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Evidence-Based Observations Card (Phase 13) */}
        {evidenceObservations.length > 0 && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 mb-10 bg-[#0B1120]/90">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FileText size={20} className="text-[#4FA3FF]" /> Direct Evidence & Observed Moments
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Recruiter analysis mapped directly to actual dialogue turns from your interview.
            </p>

            <div className="space-y-4">
              {evidenceObservations.map((obs, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4FA3FF] block">
                    {obs.topic || `Observation #${idx + 1}`}
                  </span>
                  <div className="text-xs sm:text-sm text-slate-200">
                    <strong className="text-slate-400 font-medium">What Happened:</strong> "{obs.whatHappened}"
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300">
                    <strong className="text-amber-400 font-medium">Why It Matters:</strong> {obs.whyItMatters}
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-300">
                    <strong className="text-emerald-400 font-medium">How to Improve:</strong> {obs.howToImprove}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personalized 5-Step Action Plan */}
        {personalizedPlan.length > 0 && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 mb-10 bg-gradient-to-br from-[#2F80FF]/10 to-[#1D5BD8]/10">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#4FA3FF]" /> Personalized Placement Action Plan
            </h2>
            <p className="text-xs text-slate-300 mb-6">
              Follow these concrete preparation steps before your upcoming real campus/company interviews.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {personalizedPlan.map((planItem, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3.5">
                  <div className="w-7 h-7 rounded-xl bg-[#2F80FF] text-white font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{planItem}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/interview-practice')}
            className="px-8 py-4 rounded-2xl bg-[#2F80FF] hover:bg-[#1D5BD8] text-white font-bold text-sm inline-flex items-center gap-2 transition-all shadow-xl shadow-[#2F80FF]/30 cursor-pointer"
          >
            <span>Start Another Mock Interview</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
