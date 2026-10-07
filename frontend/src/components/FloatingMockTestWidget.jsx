import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export default function FloatingMockTestWidget({ onStartMockTest }) {
  const navigate = useNavigate();
  const [isClosed, setIsClosed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleStart = () => {
    if (onStartMockTest) {
      onStartMockTest();
    } else {
      navigate('/mock-test');
    }
  };

  if (isClosed) return null;

  return (
    <div className="fixed right-4 top-1/3 z-40 max-w-[280px] sm:max-w-[300px]">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          /* Minimized Pill */
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2.5 px-4 py-3 glass-card rounded-full border border-[#2F80FF]/40 text-xs font-bold text-white shadow-xl shadow-[#2F80FF]/15 hover:border-[#2F80FF] transition-all cursor-pointer"
          >
            <span className="text-base">🎯</span>
            <span>Placement Quiz</span>
            <span className="w-2 h-2 rounded-full bg-[#2F80FF] animate-ping" />
          </motion.button>
        ) : (
          /* Full Floating Card */
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.85, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 30 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="glass-modal rounded-2xl p-5 border border-[#2F80FF]/30 shadow-2xl relative text-white overflow-hidden"
          >
            {/* Ambient Glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#2F80FF]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Controls */}
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4FA3FF]">
                <Sparkles size={12} />
                <span>FREE SKILL EVALUATION</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors text-[10px] cursor-pointer"
                  title="Minimize"
                >
                  —
                </button>
                <button
                  onClick={() => setIsClosed(true)}
                  className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-base">🎯</span> Ready to Test Yourself?
              </h4>
              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                Take a free AI-powered placement quiz and discover your strengths in just 5 minutes.
              </p>
            </div>

            {/* Glowing Action Button with Pulse */}
            <button
              onClick={handleStart}
              className="w-full py-2.5 px-4 btn-glow animate-pulse-glow rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg group cursor-pointer"
            >
              Start Mock Test
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
