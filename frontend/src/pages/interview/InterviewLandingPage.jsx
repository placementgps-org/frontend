import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquareText,
  Video,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  History,
  Bot,
  BrainCircuit,
  Eye,
  Volume2,
  Zap
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function InterviewLandingPage() {
  const navigate = useNavigate();

  const handleStart = (mode) => {
    navigate(`/interview-practice/setup?mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2F80FF]/10 border border-[#2F80FF]/30 text-[#4FA3FF] text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles size={14} className="animate-pulse text-[#4FA3FF]" />
            AI-Powered Mock Interview Simulator
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight gradient-heading">
            INTERVIEW PRACTICE
          </h1>

          <p className="text-xl sm:text-2xl text-slate-200 font-medium mt-3">
            Practice before the real interview.
          </p>

          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed max-w-2xl mx-auto">
            Experience realistic HR & personal interviews tailored to your background.
            Receive deep evidence-based evaluations on answer quality, communication, voice tone, and body language.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/interview-practice/history')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <History size={15} className="text-[#4FA3FF]" />
              View Interview History
            </button>
          </div>
        </motion.div>

        {/* Two Primary Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card A: Practice by Typing */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="glass-card relative rounded-3xl p-8 border border-slate-800/80 hover:border-[#2F80FF]/50 flex flex-col justify-between h-full bg-[#0B1120]/90">
              <div>
                {/* Header / Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2F80FF]/20 to-[#1D5BD8]/20 border border-[#2F80FF]/30 flex items-center justify-center text-[#4FA3FF] shadow-lg shadow-[#2F80FF]/10 group-hover:scale-105 transition-transform">
                    <MessageSquareText size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Text-Based
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white group-hover:text-[#4FA3FF] transition-colors mb-2">
                  Practice by Typing
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Practice HR interviews through a realistic AI chat conversation.
                </p>

                {/* What will be evaluated */}
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/60 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    What will be evaluated:
                  </span>
                  <ul className="space-y-2.5">
                    {[
                      'Answer Relevance & Structure (STAR)',
                      'Professional Communication & Tone',
                      'Project Explanations & Specifics',
                      'Handling Dynamic Follow-Up Questions',
                      'Clarity, Conciseness & Vocabulary'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 size={14} className="text-[#4FA3FF] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => handleStart('typing')}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2F80FF] hover:bg-[#1D5BD8] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2F80FF]/25 hover:shadow-[#2F80FF]/40 cursor-pointer group-hover:translate-y-[-2px]"
              >
                <span>Start Typing Interview</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Card B: Practice by Speaking */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="glass-card relative rounded-3xl p-8 border border-slate-800/80 hover:border-purple-500/50 flex flex-col justify-between h-full bg-[#0B1120]/90">
              <div>
                {/* Header / Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/10 group-hover:scale-105 transition-transform">
                    <Video size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Voice & Video AI
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                  Practice by Speaking
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Practice face-to-face with an AI interviewer and receive real-time coaching.
                </p>

                {/* What will be evaluated */}
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/60 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    What will be evaluated:
                  </span>
                  <ul className="space-y-2.5">
                    {[
                      'Spoken Answer Quality & Depth',
                      'Voice Modulation, Pace & Filler Words',
                      'Eye Contact & Camera Attention',
                      'Posture, Framing & Hand Gestures',
                      'Real-Time AI Coach Hints & Alerts'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 size={14} className="text-purple-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => handleStart('speaking')}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 cursor-pointer group-hover:translate-y-[-2px]"
              >
                <span>Start Speaking Interview</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="glass-card rounded-2xl p-6 border border-slate-800/60 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#4FA3FF] shrink-0">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Adaptive AI HR</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asks dynamic follow-up questions based on your specific responses and resume details.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800/60 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Real-Time Coaching</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Non-intrusive coaching alerts help you adjust speaking speed, eye contact, and volume live.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800/60 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">100% Client Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Video and audio are processed locally in your browser. No raw recordings are ever stored.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
