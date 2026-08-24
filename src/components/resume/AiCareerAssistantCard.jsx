import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Compass,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { resumeService } from '../../services/resumeService';

const DEFAULT_PROMPTS = [
  'What skill should I learn next?',
  'Am I ready for my recommended roles?',
  'Why is my ATS score at this level?',
  'What projects should I add to my resume?',
  'What are my biggest placement strengths?'
];

const COMPACT_PROMPTS = [
  'What should I learn next?',
  'Am I ready for target roles?',
  'What should I improve?'
];

export default function AiCareerAssistantCard({ resumeData: _resumeData, onEvaluateCourseRef }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I am your **AI Career Assistant** at Placement GPS. I have analyzed your resume, skills, and target roles.\n\nYou can ask me anything about:\n- Your **resume strengths & ATS improvements**\n- Which **skills or projects** you should focus on next\n- Whether a **specific free course** is suitable for you, too basic, or too advanced\n- Your **internship and role readiness**`,
      courseEvaluation: null
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const cardContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isExpanded]);

  // Expose evaluation trigger to parent (e.g. from CourseRecommendationsCard)
  useEffect(() => {
    if (onEvaluateCourseRef) {
      onEvaluateCourseRef.current = (course) => {
        setIsExpanded(true);
        cardContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
        handleSendMessage(`Evaluate course: ${course.courseName}`, course);
      };
    }
  }, [onEvaluateCourseRef]);

  const handleSendMessage = async (textToSend, courseData = null) => {
    const query = textToSend || inputMessage;
    if (!query.trim() && !courseData) return;

    // Automatically expand when sending a message
    setIsExpanded(true);

    const userMsgId = Date.now().toString();
    const newUserMessage = {
      id: userMsgId,
      role: 'user',
      content: courseData ? `Please evaluate the course "${courseData.courseName}" for my profile.` : query,
      courseEvaluation: null
    };

    setMessages((prev) => [...prev, newUserMessage]);
    if (!textToSend && !courseData) setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await resumeService.chatWithAssistant({
        message: query,
        conversationHistory: history,
        courseId: courseData?.courseId,
        courseName: courseData?.courseName
      });

      if (res && res.success && res.data) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.data.message || '',
          courseEvaluation: res.data.courseEvaluation || null
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(res?.message || 'Failed to get response');
      }
    } catch (err) {
      console.error('[AiCareerAssistant] Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${err.message || 'I encountered an issue analyzing your request. Please try again in a moment.'}`,
          courseEvaluation: null
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const renderSuitabilityBadge = (suitability, color) => {
    const s = (suitability || '').toLowerCase();
    if (s.includes('high') || color === 'emerald') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
          <CheckCircle2 size={13} /> {suitability || 'Highly Recommended'}
        </span>
      );
    }
    if (s.includes('too basic') || color === 'amber') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <AlertTriangle size={13} /> {suitability || 'Too Basic'}
        </span>
      );
    }
    if (s.includes('too advanced') || s.includes('not yet') || color === 'orange') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center gap-1">
          <AlertTriangle size={13} /> {suitability || 'Prerequisites Missing'}
        </span>
      );
    }
    if (s.includes('not relevant') || color === 'red') {
      return (
        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1">
          <AlertTriangle size={13} /> {suitability || 'Not Relevant'}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full bg-[#2F80FF]/10 text-[#4FA3FF] border border-[#2F80FF]/30 text-xs font-bold flex items-center gap-1">
        <CheckCircle2 size={13} /> {suitability || 'Recommended'}
      </span>
    );
  };

  return (
    <motion.div
      ref={cardContainerRef}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl border border-[#2F80FF]/30 bg-slate-950/80 mb-8 overflow-hidden shadow-[0_0_35px_rgba(47,128,255,0.07)] transition-all duration-300"
    >
      {/* ── CARD HEADER (Compact & Expanded) ── */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-950/90 via-[#2F80FF]/5 to-slate-950/90">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#2F80FF]/20 to-[#9A5BFF]/20 rounded-xl border border-[#2F80FF]/30 text-[#4FA3FF] shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">AI Career Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#2F80FF]/15 text-[#4FA3FF] text-[10px] sm:text-[11px] font-semibold border border-[#2F80FF]/30">
                AI Mentor
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
              Ask about your resume, career, skills or free courses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome',
                    role: 'assistant',
                    content: `Chat session refreshed. What would you like to explore next?`,
                    courseEvaluation: null
                  }
                ])
              }
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
              title="Reset conversation"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* Expand / Minimize Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-[#2F80FF]/10 hover:bg-[#2F80FF]/20 border border-[#2F80FF]/30 text-[#4FA3FF] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title={isExpanded ? 'Minimize chat interface' : 'Expand full chat conversation'}
          >
            {isExpanded ? (
              <>
                <Minimize2 size={13} />
                <span>Minimize</span>
              </>
            ) : (
              <>
                <Maximize2 size={13} />
                <span>Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── EXPANDED MODE: QUICK CHIPS & CONVERSATION HISTORY ── */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quick Prompt Chips */}
            <div className="px-5 pt-3.5 pb-2 border-b border-slate-800/40 bg-slate-900/30 flex gap-2 overflow-x-auto scrollbar-none">
              {DEFAULT_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-[#2F80FF]/15 border border-slate-800 hover:border-[#2F80FF]/40 text-slate-300 hover:text-[#4FA3FF] text-xs font-medium transition-all shrink-0 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages Area */}
            <div className="p-5 space-y-4 max-h-[440px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2F80FF]/20 to-[#9A5BFF]/20 border border-[#2F80FF]/40 text-[#4FA3FF] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot size={16} />
                    </div>
                  )}

                  <div className={`max-w-2xl flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* User or AI Text Bubble */}
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#2F80FF] text-white rounded-br-none shadow-md font-medium'
                          : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm space-y-2'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        msg.content
                      ) : (
                        <div className="prose prose-invert max-w-none text-xs sm:text-sm space-y-2.5">
                          {msg.content.split('\n\n').map((paragraph, pIdx) => {
                            if (paragraph.startsWith('###') || paragraph.startsWith('##')) {
                              return (
                                <h4 key={pIdx} className="font-bold text-white text-sm pt-1">
                                  {paragraph.replace(/^#+\s*/, '')}
                                </h4>
                              );
                            }
                            if (paragraph.startsWith('*') || paragraph.startsWith('-')) {
                              const items = paragraph.split('\n').filter((l) => l.trim().length > 0);
                              return (
                                <ul key={pIdx} className="list-disc pl-4 space-y-1 text-slate-300">
                                  {items.map((it, iIdx) => (
                                    <li key={iIdx}>{it.replace(/^[-*]\s*/, '')}</li>
                                  ))}
                                </ul>
                              );
                            }
                            return (
                              <p key={pIdx} className="text-slate-300">
                                {paragraph}
                              </p>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Rich Course Evaluation Card */}
                    {msg.courseEvaluation && (
                      <div className="w-full mt-3 p-5 rounded-xl bg-slate-950/90 border border-[#2F80FF]/40 shadow-lg text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <BookOpen size={15} className="text-[#4FA3FF]" />
                              <h4 className="font-bold text-white text-sm">
                                {msg.courseEvaluation.courseName}
                              </h4>
                            </div>
                            {msg.courseEvaluation.provider && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Offered by {msg.courseEvaluation.provider}
                              </p>
                            )}
                          </div>
                          <div>
                            {renderSuitabilityBadge(
                              msg.courseEvaluation.suitability,
                              msg.courseEvaluation.suitabilityBadgeColor
                            )}
                          </div>
                        </div>

                        {/* Level & Relevance Matrix */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 mb-3 text-center">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Relevance
                            </span>
                            <span className="text-sm font-bold text-[#4FA3FF]">
                              {msg.courseEvaluation.relevancePercentage || 0}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Course Level
                            </span>
                            <span className="text-xs font-semibold text-white">
                              {msg.courseEvaluation.courseLevel || 'All Levels'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Your Level
                            </span>
                            <span className="text-xs font-semibold text-emerald-400">
                              {msg.courseEvaluation.studentLevel || 'Intermediate'}
                            </span>
                          </div>
                        </div>

                        {/* Reason */}
                        {msg.courseEvaluation.reason && (
                          <div className="mb-3 p-3 rounded-lg bg-slate-900/40 border border-slate-800/60">
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                              💡 <strong className="text-white not-italic">Evaluation:</strong> "{msg.courseEvaluation.reason}"
                            </p>
                          </div>
                        )}

                        {/* Skills Gained */}
                        {msg.courseEvaluation.skillsGained && msg.courseEvaluation.skillsGained.length > 0 && (
                          <div className="mb-3">
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Skills You Would Gain:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.courseEvaluation.skillsGained.map((sk, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded bg-[#2F80FF]/10 text-[#4FA3FF] text-[11px] font-medium border border-[#2F80FF]/25"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Better Alternative / Suggested Next Step */}
                        {msg.courseEvaluation.betterAlternative && (
                          <div className="mb-3.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                            <Compass size={14} className="shrink-0 text-amber-400 mt-0.5" />
                            <div>
                              <strong className="text-amber-200">Recommended Next Step:</strong> {msg.courseEvaluation.betterAlternative}
                            </div>
                          </div>
                        )}

                        {/* Direct Link */}
                        {msg.courseEvaluation.courseLink && (
                          <button
                            onClick={() => window.open(msg.courseEvaluation.courseLink, '_blank', 'noopener,noreferrer')}
                            className="py-1.5 px-3.5 bg-[#2F80FF]/20 hover:bg-[#2F80FF]/30 border border-[#2F80FF]/40 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <span>Open Course Page</span>
                            <ExternalLink size={12} className="text-[#4FA3FF]" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center text-slate-400 text-xs italic">
                  <div className="w-8 h-8 rounded-xl bg-[#2F80FF]/20 border border-[#2F80FF]/30 text-[#4FA3FF] flex items-center justify-center shrink-0 animate-pulse">
                    <Sparkles size={16} />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-[#2F80FF]" />
                    <span>AI is reviewing your resume context & formulating guidance...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMPACT MODE QUICK PROMPTS (Only visible when minimized) ── */}
      {!isExpanded && (
        <div className="px-4 sm:px-5 pt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-none">
          {COMPACT_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-[#2F80FF]/15 border border-slate-800 hover:border-[#2F80FF]/40 text-slate-400 hover:text-[#4FA3FF] text-[11px] font-medium transition-all shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ── INPUT SUBMISSION BOX (Always Accessible) ── */}
      <div className="p-3.5 sm:p-4 bg-slate-900/60 border-t border-slate-800/80">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything about your resume, skills, target roles, or courses..."
            disabled={isLoading}
            className="flex-1 bg-slate-950/90 border border-slate-800 focus:border-[#2F80FF] rounded-xl px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-3.5 sm:px-4 py-2.5 bg-[#2F80FF] hover:bg-[#2563eb] disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 shadow-md disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            <span className="hidden sm:inline text-xs font-bold">Ask AI</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
}
