import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Terminal,
  Layers,
  Check,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Copy,
  ListOrdered,
  FileText
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { codingService } from '../../services/codingService';

const DEFAULT_STARTER_TEMPLATES = {
  python: `import sys

def solve():
    # Read input from standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    # Write your solution logic here
    pass

if __name__ == '__main__':
    solve()
`,
  javascript: `const fs = require('fs');

function solve() {
    // Read input from standard input
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    
    // Write your solution logic here
}

solve();
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (!scanner.hasNext()) return;
        
        // Write your solution logic here
    }
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Write your solution logic here
    
    return 0;
}
`
};

export default function CodingWorkspacePage() {
  const { challengeId: paramChallengeId } = useParams();

  // Navigation & Categorization States
  const [tracksAndTopics, setTracksAndTopics] = useState({ programming: [], dsa: [] });
  const [selectedTrack, setSelectedTrack] = useState('programming');
  const [selectedTopic, setSelectedTopic] = useState('Variables & Data Types');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');

  // Challenge & Editor States
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionType, setExecutionType] = useState(null); // 'run' | 'submit'
  const [activeTestTab, setActiveTestTab] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Progressive Disclosure Accordions State
  const [openSections, setOpenSections] = useState({
    inputFormat: false,
    outputFormat: false,
    constraints: false,
    examples: true,
    hints: false
  });

  // Copied indicator for example test cases
  const [copiedExampleIdx, setCopiedExampleIdx] = useState(null);

  // Hints & Deterrence States
  const [revealedHints, setRevealedHints] = useState({});
  const [showCopyPasteWarning, setShowCopyPasteWarning] = useState(false);
  const [userProgress, setUserProgress] = useState(null);

  const editorTextareaRef = useRef(null);
  const initializedTopicRef = useRef(false);

  // Toggle Accordion section
  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  // Copy sample input to clipboard
  const handleCopyInput = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedExampleIdx(idx);
    setTimeout(() => setCopiedExampleIdx(null), 2000);
  };

  // Load Topics & User Progress on Mount
  useEffect(() => {
    let isSubscribed = true;
    const fetchMetadata = async () => {
      try {
        const [topicsRes, progRes] = await Promise.allSettled([
          codingService.getTopics(),
          codingService.getProgress()
        ]);

        if (isSubscribed && topicsRes.status === 'fulfilled' && topicsRes.value.success) {
          setTracksAndTopics(topicsRes.value.data);
          if (!initializedTopicRef.current) {
            const firstTopic = topicsRes.value.data.programming?.[0]?.name || 'Variables & Data Types';
            setSelectedTopic(firstTopic);
            initializedTopicRef.current = true;
          }
        }

        if (isSubscribed && progRes.status === 'fulfilled' && progRes.value.success) {
          setUserProgress(progRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching coding metadata:', err);
      }
    };
    fetchMetadata();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Fetch or Generate Challenge (Deduplicated, Instant from DB Buffer)
  const loadChallenge = useCallback(
    async (forceNew = false) => {
      if (forceNew) {
        setIsGeneratingNew(true);
      } else {
        setLoadingChallenge(true);
      }
      setErrorMessage(null);
      setTestResults(null);
      setSubmissionSuccess(false);
      setRevealedHints({});

      try {
        const res = await codingService.getOrGenerateChallenge({
          track: selectedTrack,
          topic: selectedTopic,
          difficulty: selectedDifficulty,
          challengeId: forceNew ? null : paramChallengeId,
          forceNew
        });

        if (res.success && res.data) {
          setChallenge(res.data);
          const starter = res.data.starterTemplates?.[language] || DEFAULT_STARTER_TEMPLATES[language] || '';
          setCode(starter);
        } else {
          setErrorMessage(res.message || 'Unable to load challenge');
        }
      } catch (err) {
        console.error('Error generating challenge:', err);
        setErrorMessage(err.message || 'Unable to load challenge right now. Please try again.');
      } finally {
        setLoadingChallenge(false);
        setIsGeneratingNew(false);
      }
    },
    [selectedTrack, selectedTopic, selectedDifficulty, paramChallengeId, language]
  );

  // Trigger load when track, topic, or difficulty change
  useEffect(() => {
    loadChallenge(false);
  }, [selectedTrack, selectedTopic, selectedDifficulty, paramChallengeId]);

  // Update starter code when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (challenge?.starterTemplates?.[newLang]) {
      setCode(challenge.starterTemplates[newLang]);
    } else {
      setCode(DEFAULT_STARTER_TEMPLATES[newLang] || '');
    }
  };

  // Reset code to starter template
  const handleResetCode = () => {
    if (window.confirm('Reset editor to initial starter template?')) {
      const starter = challenge?.starterTemplates?.[language] || DEFAULT_STARTER_TEMPLATES[language] || '';
      setCode(starter);
      setTestResults(null);
    }
  };

  // Copy/Paste Deterrence Handler
  const handleEditorKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      setShowCopyPasteWarning(true);
      setTimeout(() => setShowCopyPasteWarning(false), 3500);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = editorTextareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    ';

      const newCode = code.substring(0, start) + spaces + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleEditorContextMenu = (e) => {
    e.preventDefault();
    setShowCopyPasteWarning(true);
    setTimeout(() => setShowCopyPasteWarning(false), 3500);
  };

  // Run Code (Visible test cases only)
  const handleRunCode = async () => {
    if (!challenge || !code.trim()) return;
    setExecuting(true);
    setExecutionType('run');
    setTestResults(null);
    setSubmissionSuccess(false);

    try {
      const res = await codingService.runCode({
        challengeId: challenge.challengeId,
        code,
        language
      });

      if (res.success && res.data) {
        setTestResults({
          isSubmit: false,
          allPassed: res.data.allPassed,
          passedCount: res.data.passedCount,
          totalCount: res.data.totalCount,
          overallStatus: res.data.overallStatus,
          compileError: res.data.compileError,
          results: res.data.results
        });
        setActiveTestTab(0);
      }
    } catch (err) {
      console.error('Run code error:', err);
      alert('Execution failed. Please check your syntax and try again.');
    } finally {
      setExecuting(false);
    }
  };

  // Submit Solution (Visible + Hidden test cases)
  const handleSubmitCode = async () => {
    if (!challenge || !code.trim()) return;
    setExecuting(true);
    setExecutionType('submit');
    setTestResults(null);

    try {
      const res = await codingService.submitCode({
        challengeId: challenge.challengeId,
        code,
        language
      });

      if (res.success && res.data) {
        setTestResults({
          isSubmit: true,
          allPassed: res.data.isAccepted,
          passedCount: res.data.passedCount,
          totalCount: res.data.totalCount,
          overallStatus: res.data.overallStatus,
          executionTimeMs: res.data.executionTimeMs,
          compileError: res.data.compileError,
          feedback: res.data.feedback,
          visibleResults: res.data.visibleResults,
          hiddenSummary: res.data.hiddenSummary
        });

        if (res.data.isAccepted) {
          setSubmissionSuccess(true);
          const progRes = await codingService.getProgress();
          if (progRes.success) setUserProgress(progRes.data);
        }
      }
    } catch (err) {
      console.error('Submit code error:', err);
      alert('Submission failed. Please check your internet connection and try again.');
    } finally {
      setExecuting(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch ((diff || '').toLowerCase()) {
      case 'easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      default:
        return 'text-[#4FA3FF] bg-[#2F80FF]/10 border-[#2F80FF]/30';
    }
  };

  const isCurrentChallengeSolved = userProgress?.solvedChallengeIds?.includes(challenge?.challengeId);

  // Extract structured "Your Task" step-by-step breakdown
  const getTaskSteps = () => {
    if (!challenge) return [];
    const desc = challenge.description || '';
    const lines = desc.split('\n').filter((l) => l.trim().length > 0);
    const bulletItems = lines.filter((l) => /^[0-9]+[.)]|^[-*]\s/.test(l.trim()));
    if (bulletItems.length >= 2) {
      return bulletItems.map((l) => l.replace(/^[0-9]+[.)]\s*|^[-*]\s*/, '').trim());
    }

    return [
      `Read the input data from standard input.`,
      `Process and calculate the required output logic for ${challenge.topic || 'the challenge'}.`,
      `Print the resulting answer matching the expected Output Format.`
    ];
  };

  // Status helper text for below editor
  const getEditorStatusText = () => {
    if (executing) {
      return executionType === 'submit' ? '⚡ Submitting & running all tests...' : '⚡ Running visible tests...';
    }
    if (testResults) {
      if (testResults.allPassed) {
        return `✓ Passed ${testResults.passedCount}/${testResults.totalCount} test cases`;
      }
      return `✕ Failed ${testResults.totalCount - testResults.passedCount}/${testResults.totalCount} test cases (${testResults.overallStatus})`;
    }
    return `Ready to run • ${challenge?.visibleTestCases?.length || 0} visible + ${challenge?.hiddenTestCases?.length || 0} hidden tests`;
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />

      {/* ── TOP CONTROL & FILTER BAR (Clean, Uncluttered, Sticky) ── */}
      <div className="pt-24 pb-3.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Track, Topic & Difficulty */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
              <button
                onClick={() => {
                  setSelectedTrack('programming');
                  const firstT = tracksAndTopics.programming?.[0]?.name || 'Variables & Data Types';
                  setSelectedTopic(firstT);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTrack === 'programming'
                    ? 'bg-gradient-to-r from-[#2F80FF] to-[#1D5BD8] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 size={13} />
                <span>Programming</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTrack('dsa');
                  const firstT = tracksAndTopics.dsa?.[0]?.name || 'Arrays & Subarrays';
                  setSelectedTopic(firstT);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedTrack === 'dsa'
                    ? 'bg-gradient-to-r from-[#2F80FF] to-[#9A5BFF] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={13} />
                <span>DSA</span>
              </button>
            </div>

            {/* Topic Dropdown */}
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-[#2F80FF] outline-none pr-8 cursor-pointer"
              >
                {(tracksAndTopics[selectedTrack] || []).map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Pills */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? getDifficultyColor(diff)
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Solved Count & New Challenge */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {userProgress && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="text-slate-400">Total Solved:</span>
                <span className="font-bold text-emerald-400">{userProgress.totalSolved || 0}</span>
              </div>
            )}

            <button
              onClick={() => loadChallenge(true)}
              disabled={loadingChallenge || isGeneratingNew}
              className="px-3.5 py-1.5 bg-[#2F80FF]/15 hover:bg-[#2F80FF]/25 border border-[#2F80FF]/30 hover:border-[#2F80FF]/50 text-[#4FA3FF] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingNew ? (
                <Loader2 size={13} className="animate-spin text-[#4FA3FF]" />
              ) : (
                <Sparkles size={13} />
              )}
              <span>{isGeneratingNew ? 'Preparing...' : '+ New AI Challenge'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE (Two Column Layout: 42% Left / 58% Right) ── */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-3 sm:p-5 lg:p-6 flex flex-col">
        {/* Copy/Paste Deterrence Toast */}
        <AnimatePresence>
          {showCopyPasteWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-amber-500/20 border border-amber-500/50 backdrop-blur-lg rounded-2xl text-amber-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xl"
            >
              <ShieldAlert size={16} className="text-amber-400 shrink-0" />
              <span>⚡ Keyboard copy/paste is restricted to encourage problem-solving from first principles.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {loadingChallenge ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-[#2F80FF] rounded-full animate-spin"></div>
            <div>
              <h3 className="text-base font-bold text-white">Loading challenge...</h3>
              <p className="text-xs text-slate-400 mt-1">Retrieving verified problem & test cases.</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
              <AlertTriangle size={28} className="mx-auto mb-2 text-red-400" />
              <p className="text-sm font-semibold">{errorMessage}</p>
            </div>
            <button
              onClick={() => loadChallenge(true)}
              className="px-4 py-2 bg-[#2F80FF] hover:bg-[#2563eb] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : challenge ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-grow">
            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── LEFT PANEL: PROBLEM & PROGRESSIVE DISCLOSURE (42% / 5 cols) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="glass-card rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 sm:p-5 shadow-lg flex-1 overflow-y-auto max-h-[calc(100vh-170px)] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent space-y-4">
                
                {/* 1. Header: Difficulty, Topic, Solved Badge, Title */}
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px] font-medium">
                      {challenge.topic}
                    </span>
                    {isCurrentChallengeSolved && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Solved
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                    {challenge.title}
                  </h2>
                </div>

                {/* 2. Short, Readable Problem Overview */}
                <div className="text-xs sm:text-[13px] text-slate-300 leading-relaxed space-y-2 border-t border-slate-800/80 pt-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#4FA3FF]">Problem</h4>
                  {challenge.description.split('\n\n').slice(0, 2).map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* 3. "Your Task" Highlighted Card */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#2F80FF]/10 via-slate-900/80 to-[#9A5BFF]/10 border border-[#2F80FF]/25 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4FA3FF] mb-2">
                    <ListOrdered size={14} />
                    <span>Your Task</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-200 leading-relaxed font-medium">
                    {getTaskSteps().map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* 4. Progressive Disclosure Accordions */}
                <div className="space-y-2 pt-1">
                  {/* Accordion A: Input Format */}
                  {challenge.inputFormat && (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                      <button
                        onClick={() => toggleSection('inputFormat')}
                        className="w-full p-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={13} className="text-slate-400" />
                          <span>Input Format</span>
                        </span>
                        <ChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform ${openSections.inputFormat ? 'rotate-90' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openSections.inputFormat && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-3 pb-3 text-xs text-slate-400 font-mono leading-relaxed border-t border-slate-800/60 pt-2"
                          >
                            {challenge.inputFormat}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Accordion B: Output Format */}
                  {challenge.outputFormat && (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                      <button
                        onClick={() => toggleSection('outputFormat')}
                        className="w-full p-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText size={13} className="text-slate-400" />
                          <span>Output Format</span>
                        </span>
                        <ChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform ${openSections.outputFormat ? 'rotate-90' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openSections.outputFormat && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-3 pb-3 text-xs text-slate-400 font-mono leading-relaxed border-t border-slate-800/60 pt-2"
                          >
                            {challenge.outputFormat}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Accordion C: Constraints */}
                  {challenge.constraints && challenge.constraints.length > 0 && (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                      <button
                        onClick={() => toggleSection('constraints')}
                        className="w-full p-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <AlertTriangle size={13} className="text-slate-400" />
                          <span>Constraints ({challenge.constraints.length})</span>
                        </span>
                        <ChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform ${openSections.constraints ? 'rotate-90' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openSections.constraints && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-3 pb-3 border-t border-slate-800/60 pt-2"
                          >
                            <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400 font-mono">
                              {challenge.constraints.map((c, idx) => (
                                <li key={idx}>{c}</li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Accordion D: Example Test Cases (Open by default) */}
                  {challenge.examples && challenge.examples.length > 0 && (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                      <button
                        onClick={() => toggleSection('examples')}
                        className="w-full p-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Code2 size={13} className="text-[#4FA3FF]" />
                          <span>Examples ({challenge.examples.length})</span>
                        </span>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform ${openSections.examples ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openSections.examples && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-3 pb-3 space-y-3 border-t border-slate-800/60 pt-2.5"
                          >
                            {challenge.examples.map((ex, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#4FA3FF] text-[11px]">Example {idx + 1}</span>
                                  <button
                                    onClick={() => handleCopyInput(ex.input, idx)}
                                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 py-0.5 px-1.5 rounded bg-slate-900 border border-slate-800 transition-all cursor-pointer"
                                    title="Copy Input"
                                  >
                                    {copiedExampleIdx === idx ? (
                                      <>
                                        <Check size={10} className="text-emerald-400" />
                                        <span className="text-emerald-400">Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={10} />
                                        <span>Copy Input</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2 font-mono">
                                  <div>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Input</span>
                                    <pre className="p-2 rounded bg-slate-900/90 text-slate-300 text-[11px] overflow-x-auto whitespace-pre-wrap leading-tight">
                                      {ex.input}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Output</span>
                                    <pre className="p-2 rounded bg-slate-900/90 text-emerald-400 text-[11px] overflow-x-auto whitespace-pre-wrap leading-tight">
                                      {ex.output}
                                    </pre>
                                  </div>
                                </div>

                                {ex.explanation && (
                                  <p className="text-slate-400 italic text-[11px] pt-1">
                                    <strong className="text-slate-300 not-italic">Explanation: </strong>
                                    {ex.explanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Accordion E: Progressive Hints */}
                  {challenge.hints && challenge.hints.length > 0 && (
                    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                      <button
                        onClick={() => toggleSection('hints')}
                        className="w-full p-2.5 px-3 flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Lightbulb size={13} className="text-amber-400" />
                          <span>💡 Need a Hint?</span>
                        </span>
                        <ChevronRight
                          size={14}
                          className={`text-slate-400 transition-transform ${openSections.hints ? 'rotate-90' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openSections.hints && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-3 pb-3 space-y-2 border-t border-slate-800/60 pt-2"
                          >
                            {challenge.hints.map((hintText, hIdx) => {
                              const isRevealed = revealedHints[hIdx];
                              return (
                                <div key={hIdx} className="rounded-lg border border-slate-800/80 bg-slate-950 p-2.5 text-xs">
                                  {isRevealed ? (
                                    <div>
                                      <span className="font-bold text-amber-300 block mb-1">Hint {hIdx + 1}:</span>
                                      <p className="text-slate-300 italic">{hintText}</p>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setRevealedHints((prev) => ({ ...prev, [hIdx]: true }))}
                                      className="w-full text-left font-semibold text-slate-400 hover:text-white flex items-center justify-between cursor-pointer"
                                    >
                                      <span>Reveal Hint {hIdx + 1}</span>
                                      <ChevronDown size={13} />
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* ── RIGHT PANEL: CODE EDITOR & TEST RESULTS (58% / 7 cols) ── */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              {/* Code Editor Glass Card */}
              <div className="glass-card rounded-2xl border border-[#2F80FF]/30 bg-slate-950/90 overflow-hidden shadow-2xl flex flex-col flex-1">
                
                {/* Editor Header Bar */}
                <div className="p-3 px-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Terminal size={15} className="text-[#4FA3FF]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Code Editor</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Language Selector */}
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:border-[#2F80FF] outline-none cursor-pointer"
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript (Node)</option>
                      <option value="java">Java (JDK 17)</option>
                    </select>

                    <button
                      onClick={handleResetCode}
                      title="Reset code to initial template"
                      className="p-1 px-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  </div>
                </div>

                {/* Editor Surface with Line Numbers */}
                <div className="relative flex bg-[#030610] flex-1 min-h-[320px] max-h-[420px] overflow-hidden font-mono text-xs sm:text-sm">
                  {/* Line Numbers Column */}
                  <div className="py-3 px-2 bg-slate-950/80 border-r border-slate-800 text-slate-600 text-right select-none font-mono text-xs leading-6 min-w-[36px]">
                    {code.split('\n').map((_, idx) => (
                      <div key={idx} className="h-6">
                        {idx + 1}
                      </div>
                    ))}
                  </div>

                  {/* Code Editor Textarea */}
                  <textarea
                    ref={editorTextareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onContextMenu={handleEditorContextMenu}
                    placeholder="# Write your solution here..."
                    spellCheck="false"
                    className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-600 resize-none outline-none font-mono text-xs sm:text-sm leading-6 overflow-y-auto"
                  />
                </div>

                {/* Editor Status & Action Buttons Bar */}
                <div className="p-3 px-4 border-t border-slate-800 bg-slate-900/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Status Indicator */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
                    <span className={`w-2 h-2 rounded-full ${executing ? 'bg-amber-400 animate-pulse' : testResults?.allPassed ? 'bg-emerald-400' : 'bg-[#2F80FF]'}`} />
                    <span>{getEditorStatusText()}</span>
                  </div>

                  {/* Actions: Run Code (Secondary) & Submit Solution (Primary) */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Run Code (Secondary) */}
                    <button
                      onClick={handleRunCode}
                      disabled={executing || !code.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {executing && executionType === 'run' ? (
                        <Loader2 size={13} className="animate-spin text-[#4FA3FF]" />
                      ) : (
                        <Play size={13} className="text-[#4FA3FF]" />
                      )}
                      <span>Run Code</span>
                    </button>

                    {/* Submit Solution (Primary) */}
                    <button
                      onClick={handleSubmitCode}
                      disabled={executing || !code.trim()}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2F80FF] to-[#9A5BFF] hover:from-[#3B8BFF] hover:to-[#A870FF] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {executing && executionType === 'submit' ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      <span>Submit Solution</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── COMPACT TEST RESULTS PANEL ── */}
              {testResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-xl"
                >
                  {/* Results Header */}
                  <div className="p-3 px-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {testResults.isSubmit ? 'Submission Result' : 'Test Output'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          testResults.allPassed
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {testResults.allPassed ? '🎉 Accepted' : testResults.overallStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Passed: <strong className="text-white">{testResults.passedCount}</strong> / {testResults.totalCount} test cases
                    </div>
                  </div>

                  {/* Submission Feedback Message */}
                  {testResults.feedback && (
                    <div className={`p-2.5 px-4 border-b border-slate-800/80 text-xs font-medium ${
                      testResults.allPassed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-900/80 text-slate-300'
                    }`}>
                      {testResults.feedback}
                    </div>
                  )}

                  {/* Compilation Error Banner */}
                  {testResults.compileError && (
                    <div className="p-3 px-4 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                      <strong className="text-rose-200 block mb-1">Compilation / Setup Error:</strong>
                      {testResults.compileError}
                    </div>
                  )}

                  {/* Visible Test Case Tabs */}
                  {(!testResults.isSubmit ? testResults.results : testResults.visibleResults) && (
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
                        {((!testResults.isSubmit ? testResults.results : testResults.visibleResults) || []).map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTestTab(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                              activeTestTab === idx
                                ? 'bg-slate-800 text-white border border-slate-700'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>Case {idx + 1}</span>
                            {tc.passed ? (
                              <CheckCircle2 size={11} className="text-emerald-400" />
                            ) : (
                              <XCircle size={11} className="text-rose-400" />
                            )}
                          </button>
                        ))}

                        {testResults.isSubmit && testResults.hiddenSummary && (
                          <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs font-semibold flex items-center gap-1 shrink-0 ml-auto border border-slate-800">
                            <span>Hidden: </span>
                            <strong className="text-white">
                              {testResults.hiddenSummary.hiddenPassed} / {testResults.hiddenSummary.totalHidden}
                            </strong>
                          </div>
                        )}
                      </div>

                      {/* Active Visible Test Detail */}
                      {(() => {
                        const currentTestList = !testResults.isSubmit ? testResults.results : testResults.visibleResults;
                        const currentTest = currentTestList?.[activeTestTab];
                        if (!currentTest) return null;

                        return (
                          <div className="space-y-2 text-xs font-mono">
                            <div>
                              <span className="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Input</span>
                              <pre className="p-2 rounded-lg bg-slate-900 text-slate-300 overflow-x-auto whitespace-pre-wrap leading-tight">
                                {currentTest.input}
                              </pre>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Expected Output</span>
                                <pre className="p-2 rounded-lg bg-slate-900 text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-tight">
                                  {currentTest.expectedOutput}
                                </pre>
                              </div>
                              <div>
                                <span className="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Your Output</span>
                                <pre className={`p-2 rounded-lg bg-slate-900 overflow-x-auto whitespace-pre-wrap leading-tight ${
                                  currentTest.passed ? 'text-emerald-400' : 'text-rose-400'
                                }`}>
                                  {currentTest.actualOutput || (currentTest.error ? `Error: ${currentTest.error}` : 'No output')}
                                </pre>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Submission Solved Celebration Banner */}
                  {submissionSuccess && (
                    <div className="p-3 px-4 bg-emerald-500/15 border-t border-emerald-500/40 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        <div>
                          <h4 className="font-bold text-white text-xs">🎉 Challenge Solved!</h4>
                          <p className="text-[10px] text-emerald-300">All test cases passed. Your progress has been updated.</p>
                        </div>
                      </div>

                      <button
                        onClick={() => loadChallenge(true)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <span>Next Challenge</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
