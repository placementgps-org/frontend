import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Minimize2 } from 'lucide-react';

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi! 👋 I'm your Placement GPS Assistant. Ask me anything about placements, resumes, interviews, or learning resources.",
      time: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // AI mock response
    setTimeout(() => {
      let replyText =
        "Placement GPS helps you prepare with structured roadmaps, AI resume scans, and practice questions! Click 'Login' at the top to start your journey.";

      const lower = currentInput.toLowerCase();
      if (lower.includes('resume') || lower.includes('cv')) {
        replyText =
          "Our AI Resume Analyzer scans your formatting, ATS compatibility, and project metrics to help recruiters shortlist your profile!";
      } else if (lower.includes('interview') || lower.includes('mock')) {
        replyText =
          "You can practice live HR and technical mock interviews with our AI interviewer, receiving real-time scorecards and verbal feedback!";
      } else if (lower.includes('roadmap') || lower.includes('plan')) {
        replyText =
          "Our adaptive engine generates a step-by-step preparation plan customized for your target company and available hours!";
      } else if (lower.includes('free') || lower.includes('cost')) {
        replyText =
          "Placement GPS offers free learning resources, playlists, cheat sheets, and diagnostic practice questions for all students!";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: replyText, time: 'Just now' },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {/* Chat Window (~350px × 450px) */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mb-4 w-[350px] h-[450px] glass-modal rounded-2xl border border-[#2F80FF]/40 shadow-2xl flex flex-col overflow-hidden text-white"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-[#2F80FF] flex items-center justify-center text-white shadow-lg shadow-[#2F80FF]/40">
                    <Bot size={20} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4FA3FF] rounded-full ring-2 ring-slate-900" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    Placement GPS AI
                  </h4>
                  <span className="text-[10px] text-[#4FA3FF] font-medium">Online • Career Guide</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minimize2 size={16} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-[#2F80FF] text-white rounded-br-sm shadow-md shadow-[#2F80FF]/20'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1 opacity-60">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl rounded-bl-sm text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#4FA3FF] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#4FA3FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-[#4FA3FF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-[#2F80FF] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-9 h-9 rounded-xl bg-[#2F80FF] hover:bg-[#4FA3FF] disabled:opacity-30 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Circular Glowing Trigger Button with Blue Neon Border */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2F80FF] to-[#1D5BD8] flex items-center justify-center text-white shadow-2xl relative cursor-pointer animate-neon-border"
      >
        <Bot size={26} className="drop-shadow-lg" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#4FA3FF] border-2 border-[#05070F] rounded-full animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
