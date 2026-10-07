import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  History,
  TrendingUp,
  Award,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MessageSquareText,
  Loader2,
  Sparkles,
  Plus
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { interviewService } from '../../services/interviewService';

export default function InterviewHistoryPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await interviewService.getHistory();
        if (data.success) {
          setSessions(data.sessions || []);
        } else {
          setError('Failed to fetch interview history.');
        }
      } catch (err) {
        console.error('History fetch error:', err);
        setError('Error connecting to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-[#4FA3FF] bg-blue-500/10 border-blue-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  // Reverse chronological for progression calculation
  const chronologicalSessions = [...sessions].reverse();
  const latestScore = sessions[0]?.evaluation?.overallScore;
  const initialScore = chronologicalSessions[0]?.evaluation?.overallScore;
  const scoreImprovement = (latestScore && initialScore && sessions.length > 1)
    ? latestScore - initialScore
    : 0;

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Back Link */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/interview-practice')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Interview Practice
          </button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-[#4FA3FF] text-xs font-semibold uppercase tracking-wider mb-1">
              <History size={14} /> Tracking & Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-heading">
              Interview History & Score Progression
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review previous evaluations, track score growth, and inspect evidence-based feedback.
            </p>
          </div>

          <button
            onClick={() => navigate('/interview-practice')}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#2F80FF] hover:bg-[#1D5BD8] text-white font-bold text-xs transition-all shadow-lg shadow-[#2F80FF]/25 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} /> New Practice Session
          </button>
        </motion.div>

        {/* Score Progression Strip (if 2+ sessions) */}
        {sessions.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6 border border-slate-800/80 mb-8 bg-[#0B1120]/90 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Score Progression
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-slate-300">
                    {chronologicalSessions.map((s) => s.evaluation?.overallScore || 0).join(' → ')}
                  </span>
                  {scoreImprovement > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      +{scoreImprovement} pts improvement
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="text-xs text-slate-400">
              {sessions.length} total mock interviews completed
            </span>
          </motion.div>
        )}

        {/* History List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={36} className="text-[#4FA3FF] animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error}
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 border border-slate-800/80 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#4FA3FF] flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Interview Sessions Yet</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Start your first typing or speaking mock interview to build your performance profile and track your readiness.
            </p>
            <button
              onClick={() => navigate('/interview-practice')}
              className="px-6 py-3 rounded-2xl bg-[#2F80FF] hover:bg-[#1D5BD8] text-white font-bold text-xs transition-all shadow-md shadow-[#2F80FF]/25 cursor-pointer"
            >
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((item, index) => {
              const score = item.evaluation?.overallScore || 0;
              const isSpeaking = item.mode === 'speaking';
              const sessionNum = sessions.length - index;

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-[#2F80FF]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Score Box */}
                    <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${getScoreColor(score)}`}>
                      <span className="text-xl font-black">{score}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-70">SCORE</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#4FA3FF] transition-colors">
                          Interview #{sessionNum}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
                          {item.interviewType} Track
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          {isSpeaking ? <Video size={13} className="text-purple-400" /> : <MessageSquareText size={13} className="text-[#4FA3FF]" />}
                          <span className="capitalize">{item.mode} Mode</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {formatDate(item.createdAt || item.startTime)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {item.durationMinutes || 10} Mins
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/interview-practice/report/${item._id}`)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#2F80FF] border border-slate-800 hover:border-[#2F80FF] text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <span>View Scorecard</span>
                    <ArrowRight size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
