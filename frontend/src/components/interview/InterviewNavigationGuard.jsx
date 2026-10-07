import React from 'react';
import { useBlocker } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function InterviewNavigationGuard({ isInterviewActive, onCleanup }) {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    return isInterviewActive && currentLocation.pathname !== nextLocation.pathname;
  });

  React.useEffect(() => {
    if (!isInterviewActive) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isInterviewActive]);

  const handleLeave = async () => {
    if (onCleanup) {
      await onCleanup();
    }
    blocker.proceed();
  };

  const handleStay = () => {
    blocker.reset();
  };

  if (blocker.state === 'blocked') {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#05070F]/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl border border-slate-700/80 p-6 max-w-md w-full bg-[#0B1120] shadow-2xl ring-1 ring-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Leave Interview?</h3>
          </div>
          
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            Your current interview is still in progress. If you leave now, your current interview session may be ended and your progress may be lost.
          </p>
          
          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={handleStay}
              className="px-5 py-2.5 rounded-xl bg-[#2F80FF] text-white font-semibold hover:bg-[#2F80FF]/90 transition-colors shadow-lg shadow-[#2F80FF]/20"
            >
              Continue Interview
            </button>
            <button
              onClick={handleLeave}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-red-500/10 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-colors"
            >
              Leave Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
