import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, ArrowLeft, Map, Loader2, CheckCircle2, ExternalLink, Wand2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { aiService } from '../../services/aiService';
import { roadmapService } from '../../services/roadmapService';
import ReactMarkdown from 'react-markdown';

const QUICK_QUESTIONS = [
  "What does a Cybersecurity Engineer do?",
  "I don't know what career to choose.",
  "Difference between AI Engineer and ML Engineer?",
  "What skills does a Data Engineer need?",
  "Should I choose DevOps or Cloud Architecture?",
];

export default function CareerAIAdvisor() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([{
    role: 'ai',
    content: "Hello! I'm **Placement GPS Career AI** — your personal career guide.\n\nI can help you:\n- Discover the right tech career for you\n- Understand what any role actually does\n- Build a personalized learning roadmap\n\n**What would you like to explore today?**"
  }]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(null); // career name being generated
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null); // { name, roadmap }
  const [followLoading, setFollowLoading] = useState(false);
  const [followSuccess, setFollowSuccess] = useState(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, generatingRoadmap]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await aiService.chatWithAdvisor(newMessages);

      const aiMsg = {
        role: 'ai',
        content: response.reply,
        suggestedCareers: response.suggestedCareers,
        roadmapAction: response.roadmapAction,
        generateRoadmapFor: response.generateRoadmapFor,
      };

      setMessages(prev => [...prev, aiMsg]);

      // Auto-trigger custom roadmap generation if AI signals it
      if (response.generateRoadmapFor) {
        handleGenerateCustomRoadmap(response.generateRoadmapFor);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `**Error:** ${error.message || 'Unable to connect to AI. Please try again.'}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowPredefined = async (careerId) => {
    setFollowLoading(true);
    try {
      await roadmapService.updateTargetCareer(careerId);
      setFollowSuccess(careerId);
      setTimeout(() => navigate('/roadmap'), 1000);
    } catch (error) {
      alert(error.message || 'Failed to set roadmap');
      setFollowLoading(false);
    }
  };

  const handleGenerateCustomRoadmap = async (careerName) => {
    setGeneratingRoadmap(careerName);
    setGeneratedRoadmap(null);
    try {
      const roadmap = await aiService.generateCustomRoadmap(careerName);
      setGeneratedRoadmap({ name: careerName, roadmap });
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `**Sorry**, I couldn't generate a roadmap for "${careerName}" right now. Please try again.`,
        isError: true
      }]);
    } finally {
      setGeneratingRoadmap(null);
    }
  };

  const handleFollowCustomRoadmap = async () => {
    if (!generatedRoadmap) return;
    setFollowLoading(true);
    const careerId = generatedRoadmap.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    try {
      await roadmapService.followCustomRoadmap(careerId, generatedRoadmap.roadmap);
      setFollowSuccess(careerId);
      setTimeout(() => navigate('/roadmap'), 1000);
    } catch (error) {
      alert(error.message || 'Failed to save custom roadmap');
      setFollowLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white flex flex-col font-sans">
      <Navbar onOpenLogin={() => {}} isAuthPage={false} />

      <main className="flex-grow pt-24 pb-12 flex flex-col items-center px-4">
        <div className="w-full max-w-4xl flex-grow flex flex-col glass-card rounded-2xl border border-slate-800/60 overflow-hidden shadow-2xl shadow-[#2F80FF]/10">

          {/* Header */}
          <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/career-map')} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F80FF]/30 to-[#9A5BFF]/30 flex items-center justify-center border border-[#2F80FF]/30">
                  <Sparkles className="text-[#4FA3FF]" size={20} />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-white">Placement GPS AI</h1>
                  <p className="text-xs text-[#4FA3FF]">Your Personal Career Guide</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex gap-2">
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">12 Careers</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300">Custom Roadmaps</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow p-6 overflow-y-auto space-y-5 custom-scrollbar bg-gradient-to-b from-transparent to-slate-900/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-5 ${
                  msg.role === 'user'
                    ? 'bg-[#2F80FF] text-white rounded-br-none'
                    : msg.isError
                      ? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-bl-none'
                      : 'glass-card border border-slate-700/50 rounded-bl-none text-slate-200'
                }`}>
                  {msg.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-3 text-[#4FA3FF] text-xs font-bold uppercase tracking-wider">
                      <Sparkles size={12} /> AI Career Guide
                    </div>
                  )}
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Follow Predefined Roadmap Button */}
                  {msg.role === 'ai' && msg.roadmapAction && !msg.isError && (
                    <div className="mt-5 pt-4 border-t border-slate-700/50">
                      <p className="text-xs text-slate-400 mb-3">A complete roadmap is ready for this career:</p>
                      <button
                        onClick={() => handleFollowPredefined(msg.roadmapAction)}
                        disabled={followLoading || !!followSuccess}
                        className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#2F80FF] to-[#4FA3FF] hover:opacity-90 disabled:opacity-60 text-white rounded-xl font-semibold transition-all shadow-lg shadow-[#2F80FF]/20 flex items-center justify-center gap-2"
                      >
                        {followSuccess === msg.roadmapAction ? (
                          <><CheckCircle2 size={18} /> Opening Roadmap...</>
                        ) : (
                          <><Map size={18} /> Follow This Roadmap</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Custom Roadmap Generation Trigger */}
                  {msg.role === 'ai' && msg.generateRoadmapFor && !msg.isError && (
                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <Wand2 size={12} />
                        <span>Generating a custom roadmap for <strong>{msg.generateRoadmapFor}</strong>...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-card border border-slate-700/50 rounded-2xl rounded-bl-none p-5 flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4FA3FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#4FA3FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#4FA3FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-sm text-slate-400 ml-2">Thinking...</span>
                </div>
              </div>
            )}

            {/* Custom Roadmap Generating */}
            {generatingRoadmap && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="glass-card border border-amber-500/30 rounded-2xl rounded-bl-none p-5 bg-amber-500/5 max-w-md">
                  <div className="flex items-center gap-3 mb-2 text-amber-400 text-sm font-semibold">
                    <Loader2 size={16} className="animate-spin" />
                    Generating Custom Roadmap
                  </div>
                  <p className="text-slate-400 text-xs">Building a personalized <strong className="text-amber-300">{generatingRoadmap}</strong> roadmap just for you. This may take 10-20 seconds...</p>
                </div>
              </motion.div>
            )}

            {/* Generated Custom Roadmap Preview */}
            <AnimatePresence>
              {generatedRoadmap && !generatingRoadmap && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex justify-start"
                >
                  <div className="glass-card border border-[#2F80FF]/40 rounded-2xl rounded-bl-none p-5 max-w-lg bg-[#2F80FF]/5">
                    <div className="flex items-center gap-2 mb-3 text-[#4FA3FF] text-xs font-bold uppercase tracking-wider">
                      <Wand2 size={12} /> Custom Roadmap Ready
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{generatedRoadmap.roadmap.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{generatedRoadmap.roadmap.description}</p>
                    <div className="space-y-2 mb-5">
                      {generatedRoadmap.roadmap.stages.map((stage, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-[#2F80FF]/20 flex items-center justify-center text-[#4FA3FF] font-bold flex-shrink-0">{i + 1}</span>
                          <span className="text-slate-300">{stage.title}</span>
                          <span className="text-slate-600">({stage.topics.length} topics)</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleFollowCustomRoadmap}
                      disabled={followLoading || !!followSuccess}
                      className="w-full px-6 py-3 bg-gradient-to-r from-[#2F80FF] to-[#9A5BFF] hover:opacity-90 disabled:opacity-60 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      {followSuccess ? (
                        <><CheckCircle2 size={18} /> Saving &amp; Opening...</>
                      ) : followLoading ? (
                        <><Loader2 size={18} className="animate-spin" /> Saving Roadmap...</>
                      ) : (
                        <><Map size={18} /> Follow This Roadmap</>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900 border-t border-slate-800/60">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask about careers, skills, or roadmaps..."
                disabled={isLoading}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-4 pr-14 py-4 focus:outline-none focus:border-[#2F80FF] focus:ring-1 focus:ring-[#2F80FF] transition-all disabled:opacity-50 placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 p-2.5 bg-[#2F80FF] hover:bg-[#1D5BD8] disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(q)}
                  disabled={isLoading}
                  className="text-xs text-slate-400 hover:text-[#4FA3FF] bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors border border-slate-700/50 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
