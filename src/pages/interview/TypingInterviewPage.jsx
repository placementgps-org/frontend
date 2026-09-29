import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Clock,
  LogOut,
  Sparkles,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import InterviewNavigationGuard from '../../components/interview/InterviewNavigationGuard';
import { interviewService } from '../../services/interviewService';
import { getInterviewerById } from '../../config/avatarConfig';

// ── Interview Session States ─────────────────────────────────────────────────
const SESSION_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  ACTIVE: 'ACTIVE',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  TERMINATED_INAPPROPRIATE: 'TERMINATED_INAPPROPRIATE',
  TIME_EXPIRED: 'TIME_EXPIRED',
};

// Terminal states — no further messages allowed
const TERMINAL_STATES = [
  SESSION_STATES.COMPLETED,
  SESSION_STATES.TERMINATED_INAPPROPRIATE,
  SESSION_STATES.TIME_EXPIRED,
];

// ── Client-Side Content Moderation ───────────────────────────────────────────
const PROFANITY_PATTERNS = [
  /\bf+u+c+k+/i, /\bs+h+i+t+/i, /\ba+s+s+h+o+l+e/i, /\bb+i+t+c+h/i,
  /\bd+a+m+n/i, /\bb+a+s+t+a+r+d/i, /\bd+i+c+k/i, /\bp+u+s+s+y/i,
  /\bc+u+n+t/i, /\bw+h+o+r+e/i, /\bs+l+u+t/i, /\bp+r+i+c+k/i,
  /\bc+o+c+k/i, /\bt+w+a+t/i, /\bw+a+n+k/i, /\bb+o+l+l+o+c+k/i,
  /\bm+o+t+h+e+r+f/i, /\bn+i+g+g/i, /\bf+a+g+/i, /\br+e+t+a+r+d/i,
  /\bid+i+o+t/i, /\bs+t+u+p+i+d/i, /\bd+u+m+b+a+s+s/i,
  /\bk+i+l+l\s*(you|your|u)/i, /\bdie\b/i, /\bsuicide/i,
  /\bsex/i, /\bporn/i, /\bnude/i, /\bnaked/i, /\borgasm/i,
  /\brape/i, /\bmolest/i,
  /\bchutiya/i, /\bmadarchod/i, /\bbhenchod/i, /\bgaand/i,
  /\bbhosdike/i, /\bharamkhor/i, /\bsaala/i,
];

function moderateContent(text) {
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(text)) {
      return { isInappropriate: true };
    }
  }
  return { isInappropriate: false };
}

// Common filler words in written English
const FILLER_WORDS = ['basically', 'literally', 'you know', 'kinda', 'sort of', 'umm', 'uhh', 'stuff like that', 'and all'];

export default function TypingInterviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [session, setSession] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600); // 10 mins default
  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fillerWordAlert, setFillerWordAlert] = useState(null);

  // ── New State Machine ──────────────────────────────────────────────────────
  const [interviewState, setInterviewState] = useState(SESSION_STATES.NOT_STARTED);

  // ── Strict Timer Refs (immune to stale closures) ───────────────────────────
  const interviewEndTimeRef = useRef(null);
  const interviewStateRef = useRef(SESSION_STATES.NOT_STARTED);
  const timerIntervalRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Keep ref in sync with state
  useEffect(() => {
    interviewStateRef.current = interviewState;
  }, [interviewState]);

  // ── Helper: Check if timer has expired ─────────────────────────────────────
  const isTimeExpired = useCallback(() => {
    if (!interviewEndTimeRef.current) return false;
    return Date.now() >= interviewEndTimeRef.current;
  }, []);

  // ── Helper: Is in terminal state ───────────────────────────────────────────
  const isTerminalState = useCallback(() => {
    return TERMINAL_STATES.includes(interviewStateRef.current);
  }, []);

  // ── Fetch session on load ──────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) {
      navigate('/interview-practice');
      return;
    }

    const loadSession = async () => {
      try {
        const data = await interviewService.getSession(sessionId);
        if (data.success && data.session) {
          setSession(data.session);
          setTranscript(data.session.transcript || []);

          const durationMs = (data.session.durationMinutes || 10) * 60 * 1000;
          const startTime = new Date(data.session.startTime).getTime();
          const endTime = startTime + durationMs;
          interviewEndTimeRef.current = endTime;

          const remainingMs = endTime - Date.now();
          const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
          setTimeLeftSeconds(remainingSecs);

          // Check if session is already in a terminal state from the server
          if (['completed', 'terminated', 'terminated_inappropriate'].includes(data.session.status)) {
            setInterviewState(SESSION_STATES.COMPLETED);
          } else if (remainingSecs <= 0) {
            // Timer already expired
            handleTimeExpired();
          } else {
            setInterviewState(SESSION_STATES.ACTIVE);
          }
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        setErrorMessage('Failed to load interview session.');
      }
    };

    loadSession();
  }, [sessionId, navigate]);

  // ── Strict Timer Countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (!session || isTerminalState() || isSubmittingEval) return;

    timerIntervalRef.current = setInterval(() => {
      if (!interviewEndTimeRef.current) return;

      const remainingMs = interviewEndTimeRef.current - Date.now();
      const remainingSecs = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSeconds(remainingSecs);

      if (remainingSecs <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        // Only trigger time expiry if not already in a terminal state
        if (!TERMINAL_STATES.includes(interviewStateRef.current)) {
          handleTimeExpired();
        }
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [session, isSubmittingEval, interviewState]);

  // ── Auto scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, isAiThinking]);

  // ── Handle Time Expiry ─────────────────────────────────────────────────────
  const handleTimeExpired = useCallback(() => {
    if (TERMINAL_STATES.includes(interviewStateRef.current)) return;

    setInterviewState(SESSION_STATES.TIME_EXPIRED);
    setIsAiThinking(false);
    setTimeLeftSeconds(0);

    // Add the time-expired system message to transcript
    setTranscript(prev => [
      ...prev,
      {
        speaker: 'ai',
        text: '⏱️ Interview Time Completed\n\nYour interview time has ended. Thank you for participating.\n\nYour interview report is being generated...',
        timestamp: new Date(),
        metrics: { topic: 'Time Expired', isSystemMessage: true },
      }
    ]);

    // Automatically generate the report
    handleFinishInterview(true);
  }, []);

  // ── Handle Inappropriate Language Termination ──────────────────────────────
  const handleInappropriateTermination = useCallback(() => {
    setInterviewState(SESSION_STATES.TERMINATED_INAPPROPRIATE);
    setIsAiThinking(false);

    // Clear timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    // Add termination message to transcript
    setTranscript(prev => [
      ...prev,
      {
        speaker: 'ai',
        text: '⚠️ Interview Terminated\n\nYour response contains inappropriate language that is not acceptable in a professional interview environment.\n\nThe interview has been ended. Please restart the interview and maintain professional communication.',
        timestamp: new Date(),
        metrics: { topic: 'Terminated — Inappropriate Language', isSystemMessage: true },
      }
    ]);

    // Generate report for terminated interview
    handleFinishInterview(false);
  }, []);

  // ── Live text behavior inspection ──────────────────────────────────────────
  const analyzeAnswerLocally = (text) => {
    const lower = text.toLowerCase();
    const detectedFillers = FILLER_WORDS.filter((f) => lower.includes(f));
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    return {
      wordCount,
      detectedFillers,
      hasFillers: detectedFillers.length > 0,
      isShort: wordCount > 0 && wordCount < 10,
    };
  };

  // ── Handle Send ────────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    if (e) e.preventDefault();

    // ── Guard: Only ACTIVE state allows sending ──────────────────────────────
    if (interviewStateRef.current !== SESSION_STATES.ACTIVE) return;
    if (!inputText.trim() || isAiThinking || isSubmittingEval) return;

    const answer = inputText.trim();

    // ── Step 1: Check timer BEFORE processing ────────────────────────────────
    if (isTimeExpired()) {
      handleTimeExpired();
      return;
    }

    // ── Step 2: Client-side moderation check ─────────────────────────────────
    const modResult = moderateContent(answer);
    if (modResult.isInappropriate) {
      // Add the candidate's message to transcript (so they see what they typed)
      setTranscript(prev => [
        ...prev,
        { speaker: 'student', text: answer, timestamp: new Date(), metrics: { flagged: true } }
      ]);
      setInputText('');
      handleInappropriateTermination();
      return;
    }

    const metrics = analyzeAnswerLocally(answer);

    // Show temporary gentle hint if too short or multiple fillers
    if (metrics.hasFillers && metrics.detectedFillers.length >= 2) {
      setFillerWordAlert(`Tip: Consider replacing casual fillers like "${metrics.detectedFillers.join(', ')}" with structured explanations.`);
      setTimeout(() => setFillerWordAlert(null), 6000);
    }

    // ── Step 3: Set PROCESSING state (prevents duplicate sends) ──────────────
    setInterviewState(SESSION_STATES.PROCESSING);

    // Optimistically update transcript
    const updated = [
      ...transcript,
      { speaker: 'student', text: answer, timestamp: new Date(), metrics }
    ];
    setTranscript(updated);
    setInputText('');
    setIsAiThinking(true);

    try {
      const res = await interviewService.sendAnswerTurn(sessionId, {
        studentAnswer: answer,
        metrics,
        isEnding: isEnding,
      });

      // ── Step 4: Post-response timer check (race-condition protection) ──────
      if (isTimeExpired() || TERMINAL_STATES.includes(interviewStateRef.current)) {
        // Timer expired while AI was generating — discard the AI response
        if (interviewStateRef.current !== SESSION_STATES.TIME_EXPIRED) {
          handleTimeExpired();
        }
        return;
      }

      // Handle server-side time expiry
      if (res.timeExpired) {
        handleTimeExpired();
        return;
      }

      // Handle server-side moderation termination
      if (res.terminated && res.terminationReason === 'inappropriate_language') {
        handleInappropriateTermination();
        return;
      }

      if (res.success && res.transcript) {
        setTranscript(res.transcript);
        if (res.aiResponse?.isFinished) {
          // Graceful conclusion
          handleFinishInterview(false);
          return;
        }
      }

      // ── Step 5: Final timer check before returning to ACTIVE ───────────────
      if (isTimeExpired()) {
        handleTimeExpired();
        return;
      }

      // Return to ACTIVE state — ready for next candidate message
      setInterviewState(SESSION_STATES.ACTIVE);
    } catch (err) {
      console.error('Turn error:', err);
      setErrorMessage('Failed to receive response. Please try again.');
      // Return to ACTIVE so the candidate can retry
      if (!isTerminalState()) {
        setInterviewState(SESSION_STATES.ACTIVE);
      }
    } finally {
      setIsAiThinking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // ── Handle Finish Interview ────────────────────────────────────────────────
  const handleFinishInterview = async (isTimeout = false) => {
    if (isSubmittingEval) return;
    setIsSubmittingEval(true);
    setShowEndConfirm(false);

    try {
      const res = await interviewService.submitEvaluation(sessionId, {
        speechMetrics: { isEvaluated: false, clarityScore: 85 },
        visualMetrics: { isEvaluated: false },
        coachingEvents: [],
      });

      if (res.success) {
        navigate(`/interview-practice/report/${sessionId}`);
      } else {
        setErrorMessage('Failed to generate report. Redirecting...');
        navigate(`/interview-practice/report/${sessionId}`);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      navigate(`/interview-practice/report/${sessionId}`);
    }
  };

  // Format timer MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const interviewer = getInterviewerById(session?.interviewerId || 'sarah');

  // ── Derived UI state ───────────────────────────────────────────────────────
  const isInputDisabled = interviewState !== SESSION_STATES.ACTIVE || isAiThinking || isSubmittingEval;
  const isSendDisabled = !inputText.trim() || isInputDisabled;
  const isInTerminalState = TERMINAL_STATES.includes(interviewState);
  
  const isInterviewActive = session !== null && !isInTerminalState && !isEnding && !isSubmittingEval;

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-hidden flex flex-col h-screen">
      <InterviewNavigationGuard isInterviewActive={isInterviewActive} />
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-grow pt-24 pb-4 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full flex flex-col h-full overflow-hidden">
        {/* Top Header & Status Bar */}
        <div className="glass-card rounded-2xl px-5 py-3 border border-slate-800/80 mb-3 flex items-center justify-between shrink-0 bg-[#0B1120]/90">
          <div className="flex items-center gap-3.5">
            <img
              src={interviewer.avatarImg}
              alt={interviewer.name}
              className="w-10 h-10 rounded-xl object-cover border border-[#2F80FF]/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{interviewer.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-[#4FA3FF] border border-blue-500/20">
                  {session?.interviewType === 'hr' ? 'HR Interview' : session?.interviewType === 'personal' ? 'Personal' : 'Mixed HR'}
                </span>
                {/* Session state indicator */}
                {isInTerminalState && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    interviewState === SESSION_STATES.TERMINATED_INAPPROPRIATE
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {interviewState === SESSION_STATES.TERMINATED_INAPPROPRIATE ? 'Terminated' : 'Ended'}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">{interviewer.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold font-mono transition-colors ${
              isInTerminalState
                ? 'bg-slate-900 border-slate-700 text-slate-500'
                : timeLeftSeconds < 120
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
            }`}>
              <Clock size={14} className={isInTerminalState ? 'text-slate-500' : timeLeftSeconds < 120 ? 'text-red-400' : 'text-[#4FA3FF]'} />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            {/* End Interview Button */}
            {!isInTerminalState && (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">End & Evaluate</span>
              </button>
            )}
          </div>
        </div>

        {/* Filler alert / coaching nudge */}
        <AnimatePresence>
          {fillerWordAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2"
            >
              <Sparkles size={14} className="shrink-0 text-amber-400" />
              <span>{fillerWordAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages Area */}
        <div className="flex-grow glass-card rounded-2xl p-4 sm:p-6 border border-slate-800/80 overflow-y-auto space-y-4 bg-[#080D1A]/80 custom-scrollbar">
          {transcript.map((msg, index) => {
            const isAi = msg.speaker === 'ai';
            const isSystemMessage = msg.metrics?.isSystemMessage;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <img
                    src={interviewer.avatarImg}
                    alt={interviewer.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#2F80FF]/30 shrink-0 mt-1"
                  />
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    isSystemMessage
                      ? msg.metrics?.topic?.includes('Inappropriate')
                        ? 'bg-red-900/30 border border-red-500/40 text-red-200 rounded-tl-none shadow-md shadow-red-900/20'
                        : 'bg-amber-900/20 border border-amber-500/30 text-amber-200 rounded-tl-none shadow-md shadow-amber-900/20'
                      : isAi
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none shadow-md shadow-black/20'
                        : msg.metrics?.flagged
                          ? 'bg-red-800/60 text-red-200 rounded-tr-none shadow-md shadow-red-900/15 font-medium line-through opacity-60'
                          : 'bg-[#2F80FF] text-white rounded-tr-none shadow-md shadow-[#2F80FF]/15 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {isSystemMessage
                        ? (msg.metrics?.topic?.includes('Inappropriate') ? '⚠️ System' : '⏱️ System')
                        : isAi ? interviewer.name : 'You (Candidate)'}
                    </span>
                    {msg.metrics?.topic && isAi && !isSystemMessage && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-[#4FA3FF]">
                        {msg.metrics.topic}
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {!isAi && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 font-bold text-xs ${
                    msg.metrics?.flagged ? 'bg-red-600 text-red-200' : 'bg-[#2F80FF] text-white'
                  }`}>
                    You
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* AI Thinking Animation */}
          {isAiThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start items-center"
            >
              <img
                src={interviewer.avatarImg}
                alt={interviewer.name}
                className="w-8 h-8 rounded-full object-cover border border-[#2F80FF]/30 shrink-0"
              />
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <span className="text-xs text-slate-400">{interviewer.name} is listening & evaluating...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-[#2F80FF] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#2F80FF] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#2F80FF] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Text Area */}
        <div className="mt-3 shrink-0">
          <form onSubmit={handleSend} className="glass-card rounded-2xl p-2.5 border border-slate-800/80 flex items-end gap-2 bg-[#0B1120]/95">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isInTerminalState
                  ? 'Interview has ended. No further messages can be sent.'
                  : interviewState === SESSION_STATES.PROCESSING
                    ? 'Waiting for interviewer response...'
                    : 'Type your response naturally here... (Press Enter to send, Shift+Enter for new line)'
              }
              disabled={isInputDisabled}
              className="flex-grow bg-transparent border-0 outline-none text-sm text-white placeholder-slate-500 resize-none px-3 py-1.5 max-h-32"
            />

            <button
              type="submit"
              disabled={isSendDisabled}
              className="p-3 rounded-xl bg-[#2F80FF] hover:bg-[#1D5BD8] disabled:opacity-30 text-white font-bold transition-all shadow-md shadow-[#2F80FF]/25 cursor-pointer shrink-0"
              title="Send Response"
            >
              <Send size={16} />
            </button>
          </form>

          <div className="flex justify-between items-center px-2 pt-1 text-[11px] text-slate-500">
            <span>Words: {inputText.trim().split(/\s+/).filter(Boolean).length}</span>
            <span>Follow-up questions are tailored dynamically to your responses.</span>
          </div>
        </div>

        {/* Confirmation Modal to End Interview */}
        {showEndConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Conclude Interview & Generate Scorecard?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Are you ready to submit your answers? The AI evaluator will generate your detailed 9-category performance breakdown, evidence quotes, and personalized improvement plan.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Continue Practicing
                </button>
                <button
                  type="button"
                  onClick={() => handleFinishInterview(false)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-red-600/20"
                >
                  End & View Report
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Loading Overlay while generating evaluation */}
        {isSubmittingEval && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="text-center max-w-sm">
              <Loader2 size={40} className="text-[#4FA3FF] animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Analyzing Interview & Building Scorecard...</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Evaluating communication clarity, answer depth, professional vocabulary, and follow-up handling.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
