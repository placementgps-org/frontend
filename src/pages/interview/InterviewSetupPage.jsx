import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  Briefcase,
  UserCheck,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Loader2,
  Video,
  MessageSquareText,
  AlertCircle,
  Shuffle,
  Volume2,
  User
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { INTERVIEWER_AVATARS, getInterviewerById } from '../../config/avatarConfig';
import { interviewService } from '../../services/interviewService';

/**
 * Pick a random interviewer from a candidate pool, avoiding the last one used if possible.
 */
function pickInterviewerFromPool(pool) {
  const lastUsedId = sessionStorage.getItem('pgps_last_interviewer');
  const candidates = pool.filter(a => a.id !== lastUsedId);
  const targetPool = candidates.length > 0 ? candidates : pool;
  const chosen = targetPool[Math.floor(Math.random() * targetPool.length)] || INTERVIEWER_AVATARS[0];
  sessionStorage.setItem('pgps_last_interviewer', chosen.id);
  return chosen.id;
}

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'speaking' ? 'speaking' : 'typing';

  const [mode, setMode] = useState(initialMode);
  const [interviewType, setInterviewType] = useState('mixed');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [selectedInterviewerId, setSelectedInterviewerId] = useState('random');
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'female' | 'male'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const interviewTypes = [
    {
      id: 'hr',
      title: 'HR Interview',
      badge: 'Behavioral & Culture',
      description: 'Situational questions, team conflict resolution, work ethic, leadership, and company alignment.',
      icon: Briefcase,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
    },
    {
      id: 'personal',
      title: 'Personal Interview',
      badge: 'Background & Ambition',
      description: 'Self-introduction, motivations, career trajectory, educational achievements, and personal passions.',
      icon: UserCheck,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30'
    },
    {
      id: 'mixed',
      title: 'Mixed HR + Personal',
      badge: 'Recommended',
      description: 'Comprehensive simulation testing introduction, resume projects, behavioral depth, and follow-up handling.',
      icon: Layers,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    }
  ];

  const durations = [
    { value: 5, label: '5 Minutes', sub: 'Quick Sprint (~3-4 Questions)' },
    { value: 10, label: '10 Minutes', sub: 'Standard HR (~6-8 Questions)' },
    { value: 15, label: '15 Minutes', sub: 'Comprehensive (~10-12 Questions)' }
  ];

  const beforeYouStartRules = [
    'Answer naturally and speak in your own authentic words.',
    'Be honest about your skills and experience — avoid fabricated claims.',
    'Keep your answers clear, structured, and strictly relevant.',
    'Avoid recitation of memorized textbook answers.',
    'Maintain professional workplace language and courtesy at all times.',
    'When discussing projects, clearly explain your specific individual contribution.',
    'Do not panic when the AI interviewer asks dynamic follow-up questions.',
    'The system evaluates both communication substance and professional interview behavior.'
  ];

  // Filter available personas based on gender tab
  const displayedAvatars = INTERVIEWER_AVATARS.filter((avatar) => {
    if (genderFilter === 'female') return avatar.gender === 'female';
    if (genderFilter === 'male') return avatar.gender === 'male';
    return true;
  });

  const resolvedInterviewer = selectedInterviewerId !== 'random'
    ? getInterviewerById(selectedInterviewerId)
    : null;

  const handleStartInterview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine final interviewer ID
      let finalInterviewerId;
      if (selectedInterviewerId !== 'random') {
        finalInterviewerId = selectedInterviewerId;
      } else {
        const pool = genderFilter === 'all'
          ? INTERVIEWER_AVATARS
          : INTERVIEWER_AVATARS.filter(a => a.gender === genderFilter);
        finalInterviewerId = pickInterviewerFromPool(pool);
      }

      const response = await interviewService.startSession({
        mode,
        interviewType,
        durationMinutes,
        interviewerId: finalInterviewerId
      });

      if (response.success && response.session) {
        const targetPath = mode === 'speaking'
          ? `/interview-practice/speaking?sessionId=${response.session._id}`
          : `/interview-practice/typing?sessionId=${response.session._id}`;

        navigate(targetPath);
      } else {
        setError('Failed to initiate interview session. Please try again.');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err.message || 'Error starting interview. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/interview-practice')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Mode Selection
          </button>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-[#4FA3FF] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles size={14} /> Step 2: Configure Your Session
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-heading">
            Interview Setup & Guidance
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-2xl">
            Customize your interview type, duration, and interviewer persona before entering the live simulation.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Config Options */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mode Switcher */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
                1. Select Interview Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMode('typing')}
                  className={`p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                    mode === 'typing'
                      ? 'bg-[#2F80FF]/15 border-[#2F80FF] text-white shadow-md shadow-[#2F80FF]/10'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${mode === 'typing' ? 'bg-[#2F80FF] text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <MessageSquareText size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Typing Practice</span>
                    <span className="text-xs opacity-70">Interactive AI Chat</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('speaking')}
                  className={`p-4 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                    mode === 'speaking'
                      ? 'bg-purple-500/15 border-purple-500 text-white shadow-md shadow-purple-500/10'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${mode === 'speaking' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Video size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Speaking Practice</span>
                    <span className="text-xs opacity-70">Voice + Video AI Call</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Interview Type Selector */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
                2. Select Interview Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {interviewTypes.map((type) => {
                  const isSelected = interviewType === type.id;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setInterviewType(type.id)}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-slate-900 border-[#2F80FF] ring-1 ring-[#2F80FF] shadow-lg shadow-[#2F80FF]/15'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-xl border ${type.color}`}>
                            <Icon size={18} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-[#2F80FF]/20 text-[#4FA3FF]' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {type.badge}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white mb-1.5">{type.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{type.description}</p>
                      </div>
                      {isSelected && (
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-[#4FA3FF] font-semibold">
                          <CheckCircle2 size={13} /> Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 3. Choose Interviewer Persona & Voice (Optional) ── */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    3. Choose Interviewer Persona & Voice
                  </label>
                  <span className="text-xs text-slate-500">Pick a specific interviewer or let the system surprise you</span>
                </div>

                {/* Gender Tabs */}
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setGenderFilter('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      genderFilter === 'all'
                        ? 'bg-[#2F80FF] text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenderFilter('female')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      genderFilter === 'female'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Female (4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGenderFilter('male')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      genderFilter === 'male'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Male (4)
                  </button>
                </div>
              </div>

              {/* Persona Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Random / Surprise Me Option */}
                <button
                  type="button"
                  onClick={() => setSelectedInterviewerId('random')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedInterviewerId === 'random'
                      ? 'bg-gradient-to-b from-purple-500/20 to-blue-500/20 border-purple-500 text-white ring-1 ring-purple-500 shadow-md shadow-purple-500/10'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Shuffle size={18} />
                    </div>
                    {selectedInterviewerId === 'random' && (
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white">Surprise Me!</span>
                    <span className="text-[10px] text-purple-300">
                      Random {genderFilter === 'all' ? 'Interviewer' : `${genderFilter} Voice`}
                    </span>
                  </div>
                </button>

                {/* Individual Personas */}
                {displayedAvatars.map((persona) => {
                  const isSelected = selectedInterviewerId === persona.id;
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => setSelectedInterviewerId(persona.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? 'bg-[#2F80FF]/15 border-[#2F80FF] text-white ring-1 ring-[#2F80FF] shadow-md shadow-[#2F80FF]/15'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <img
                          src={persona.avatarImg}
                          alt={persona.name}
                          className="w-10 h-10 rounded-xl object-cover object-top border border-slate-700"
                        />
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                          persona.gender === 'female' ? 'bg-pink-500/20 text-pink-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {persona.gender}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white line-clamp-1">{persona.name}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{persona.badge}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selector */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  4. Select Duration
                </label>
                <span className="text-xs text-slate-400">Min: 5 mins • Max: 15 mins</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {durations.map((d) => {
                  const isSelected = durationMinutes === d.value;
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDurationMinutes(d.value)}
                      className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2F80FF]/15 border-[#2F80FF] text-white ring-1 ring-[#2F80FF]'
                          : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock size={16} className={isSelected ? 'text-[#4FA3FF]' : 'text-slate-400'} />
                        <span className="font-bold text-sm text-white">{d.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">{d.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Before You Start Section */}
            <div className="glass-card rounded-2xl p-6 border border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center gap-2 mb-4">
                <Info size={18} className="text-[#4FA3FF]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Before You Start: Guidelines for Candidates
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {beforeYouStartRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 size={14} className="text-[#4FA3FF] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Session Summary Card & Action Button */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-slate-800/80 sticky top-28 bg-[#0B1120]/90">
              <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-slate-800">
                Session Summary
              </h3>

              <div className="space-y-3.5 text-xs mb-6">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Mode</span>
                  <span className="font-bold text-white capitalize flex items-center gap-1.5">
                    {mode === 'speaking' ? <Video size={13} className="text-purple-400" /> : <MessageSquareText size={13} className="text-[#4FA3FF]" />}
                    {mode === 'speaking' ? 'Voice & Video AI' : 'Typing Chat'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Interview Type</span>
                  <span className="font-bold text-white capitalize">
                    {interviewType === 'hr' ? 'HR Interview' : interviewType === 'personal' ? 'Personal' : 'Mixed HR + Personal'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-bold text-white">{durationMinutes} Minutes</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Interviewer</span>
                  {resolvedInterviewer ? (
                    <span className="font-bold text-white flex items-center gap-2">
                      <img
                        src={resolvedInterviewer.avatarImg}
                        alt={resolvedInterviewer.name}
                        className="w-5 h-5 rounded-full object-cover object-top border border-purple-500/40"
                      />
                      <span>{resolvedInterviewer.name}</span>
                    </span>
                  ) : (
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Shuffle size={13} className="text-purple-400" />
                      Random {genderFilter === 'all' ? '(Any)' : `(${genderFilter})`}
                    </span>
                  )}
                </div>
              </div>

              {/* Evaluation Categories Included */}
              <div className="bg-slate-900/70 rounded-2xl p-4 border border-slate-800/80 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Evaluation Dimensions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Communication',
                    'Answer Quality',
                    'Professionalism',
                    'Relevance',
                    'Follow-up Handling',
                    ...(mode === 'speaking' ? ['Voice & Pacing', 'Eye Contact', 'Body Composure'] : [])
                  ].map((dim, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                      {dim}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleStartInterview}
                className="w-full py-4 px-6 rounded-2xl bg-[#2F80FF] hover:bg-[#1D5BD8] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2F80FF]/25 hover:shadow-[#2F80FF]/40 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Preparing Interview Room...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Interview Room</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500 mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                No raw audio or video is stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
