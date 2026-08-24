import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Mail, Phone, Calendar, Shield, LogOut, Code2, Map,
  FileCheck2, BookOpenCheck, Mic, ArrowRight, Activity, TrendingUp, TrendingDown,
  BarChart3, Building2, Target
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingMockTestWidget from '../components/FloatingMockTestWidget';
import { useAuth } from '../context/AuthContext';
import { aptitudeService } from '../services/aptitudeService';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [aptitudeProgress, setAptitudeProgress] = React.useState(null);

  React.useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await aptitudeService.getProgress();
        if (data.success) {
          setAptitudeProgress(data.progress);
        }
      } catch (err) {
        console.error('Failed to fetch aptitude progress', err);
      }
    };
    fetchProgress();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const modules = [
    { title: 'Practice Arena', description: 'Practice coding & aptitude questions', icon: Code2, path: '/practice', color: 'from-blue-500 to-cyan-500' },
    { title: 'Roadmap', description: 'Get your personalized prep plan', icon: Map, path: '/roadmap', color: 'from-violet-500 to-purple-500' },
    { title: 'Resume Analyser', description: 'AI-powered resume optimization', icon: FileCheck2, path: '/resume-analyser', color: 'from-emerald-500 to-teal-500' },
    { title: 'Free Courses', description: 'Curated learning resources', icon: BookOpenCheck, path: '/free-courses', color: 'from-amber-500 to-orange-500' },
    { title: 'Interview Practice', description: 'AI mock interviews & feedback', icon: Mic, path: '/interview-practice', color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden relative flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />
      <FloatingMockTestWidget onStartMockTest={() => navigate('/mock-test')} />

      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight gradient-heading">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Continue your journey to your dream career
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT COL: Profile Card & Modules */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="glass-card rounded-2xl p-6 border border-slate-800/60">
                <div className="flex flex-col items-center mb-6">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-[#2F80FF]/30 shadow-lg shadow-[#2F80FF]/10" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2F80FF] to-[#1D5BD8] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#2F80FF]/20">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-white mt-3">{user?.name}</h2>
                  <span className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role || 'User'}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={14} className="text-[#4FA3FF] shrink-0" />
                    <span className="text-slate-300 truncate">{user?.email}</span>
                    {user?.emailVerified && <Shield size={12} className="text-emerald-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={14} className="text-[#4FA3FF] shrink-0" />
                    <span className="text-slate-300">{user?.phone}</span>
                    {user?.phoneVerified && <Shield size={12} className="text-emerald-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={14} className="text-[#4FA3FF] shrink-0" />
                    <span className="text-slate-300">Joined {formatDate(user?.createdAt)}</span>
                  </div>
                </div>

                <button onClick={handleLogout} className="w-full mt-6 py-2.5 px-4 bg-slate-900/80 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-xl text-sm font-medium text-slate-300 hover:text-red-400 flex items-center justify-center gap-2 transition-all">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <LayoutDashboard size={14} className="text-[#4FA3FF]" />
                Your Modules
              </h3>
              <div className="space-y-3">
                {modules.map((module, i) => (
                  <Link key={module.path} to={module.path} className="block group">
                    <div className="glass-card rounded-xl p-4 border border-slate-800/60 cursor-pointer group-hover:border-[#2F80FF]/40 transition-all duration-300 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center shrink-0`}>
                        <module.icon size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-[#4FA3FF] transition-colors">{module.title}</h4>
                      </div>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-[#4FA3FF] group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COL: Advanced Aptitude Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-3 space-y-6">
            
            {aptitudeProgress && aptitudeProgress.overall.totalAttempts > 0 ? (
              <div className="space-y-6">
                {/* Top Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-center items-center text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Overall Accuracy</span>
                    <span className="text-3xl font-bold text-[#4FA3FF]">{aptitudeProgress.overall.accuracy}%</span>
                  </div>
                  <div className="glass-card rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-center items-center text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Total Attempted</span>
                    <span className="text-3xl font-bold text-white">{aptitudeProgress.overall.totalAttempts}</span>
                  </div>
                  <div className="glass-card rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-center items-center text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Correct Answers</span>
                    <span className="text-3xl font-bold text-emerald-400">{aptitudeProgress.overall.totalCorrect}</span>
                  </div>
                  <div className="glass-card rounded-2xl p-5 border border-slate-800/60 flex flex-col justify-center items-center text-center">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-1">Topics Completed</span>
                    <span className="text-3xl font-bold text-purple-400">{aptitudeProgress.topics?.all?.length || 0}</span>
                  </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Category Progress */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <BarChart3 size={16} className="text-[#4FA3FF]" /> By Category
                    </h3>
                    <div className="space-y-4">
                      {aptitudeProgress.categories.map((cat, idx) => {
                        const accuracy = cat.attempts > 0 ? Math.round((cat.correct / cat.attempts) * 100) : 0;
                        return (
                          <div key={idx}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-300 capitalize">{cat._id}</span>
                              <span className="text-white font-medium">{accuracy}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#2F80FF] to-[#1D5BD8]" style={{ width: `${accuracy}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Strongest & Weakest */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800/60 flex flex-col gap-6">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <TrendingUp size={16} /> Strongest Topics
                      </h3>
                      <div className="space-y-2">
                        {aptitudeProgress.topics?.strongest?.map((t, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 text-sm">
                            <span className="text-slate-300 truncate">{t.topic}</span>
                            <span className="text-emerald-400 font-bold">{t.accuracy}%</span>
                          </div>
                        ))}
                        {(!aptitudeProgress.topics?.strongest || aptitudeProgress.topics.strongest.length === 0) && (
                          <div className="text-slate-500 text-sm">Not enough data</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <TrendingDown size={16} /> Weakest Topics
                      </h3>
                      <div className="space-y-2">
                        {aptitudeProgress.topics?.weakest?.map((t, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 text-sm">
                            <span className="text-slate-300 truncate">{t.topic}</span>
                            <span className="text-red-400 font-bold">{t.accuracy}%</span>
                          </div>
                        ))}
                        {(!aptitudeProgress.topics?.weakest || aptitudeProgress.topics.weakest.length === 0) && (
                          <div className="text-slate-500 text-sm">Not enough data</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Difficulty */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Target size={16} className="text-amber-400" /> By Difficulty
                    </h3>
                    <div className="space-y-3">
                      {['Easy', 'Medium', 'Hard'].map((diff) => {
                        const stat = aptitudeProgress.difficulties?.find(d => d._id === diff);
                        const accuracy = stat && stat.attempts > 0 ? Math.round((stat.correct / stat.attempts) * 100) : 0;
                        const color = diff === 'Easy' ? 'bg-emerald-400' : diff === 'Medium' ? 'bg-amber-400' : 'bg-red-400';
                        return (
                          <div key={diff} className="flex items-center gap-4">
                            <span className="text-sm text-slate-300 w-16">{diff}</span>
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full ${color}`} style={{ width: `${accuracy}%` }}></div>
                            </div>
                            <span className="text-sm font-medium text-white w-10 text-right">{accuracy}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Company */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Building2 size={16} className="text-indigo-400" /> Company Practice
                    </h3>
                    {aptitudeProgress.companies && aptitudeProgress.companies.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {aptitudeProgress.companies.map((comp, idx) => {
                          const accuracy = comp.attempts > 0 ? Math.round((comp.correct / comp.attempts) * 100) : 0;
                          return (
                            <div key={idx} className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2 flex flex-col">
                              <span className="text-xs text-indigo-300 font-medium">{comp._id}</span>
                              <span className="text-lg font-bold text-white">{accuracy}% <span className="text-[10px] text-slate-500 font-normal">ACC</span></span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-sm">No company practice data yet.</div>
                    )}
                  </div>
                </div>

                {/* Daily History Chart (Simplified visual rep) */}
                {aptitudeProgress.daily && aptitudeProgress.daily.length > 0 && (
                  <div className="glass-card rounded-2xl p-6 border border-slate-800/60">
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Activity size={16} className="text-[#4FA3FF]" /> Last 7 Days Activity
                    </h3>
                    <div className="flex items-end justify-between h-32 gap-2 mt-4">
                      {aptitudeProgress.daily.map((day, idx) => {
                        // find max attempts to scale bars
                        const maxAttempts = Math.max(...aptitudeProgress.daily.map(d => d.attempts), 10);
                        const heightPercent = Math.max((day.attempts / maxAttempts) * 100, 5);
                        const dateObj = new Date(day._id);
                        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <div key={idx} className="flex flex-col items-center flex-1 group">
                            <span className="text-[10px] font-bold text-white mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{day.attempts}</span>
                            <div className="w-full max-w-[40px] bg-slate-800 rounded-t-md relative flex items-end justify-center" style={{ height: '100px' }}>
                              <div className="w-full bg-[#2F80FF] rounded-t-md transition-all duration-500" style={{ height: `${heightPercent}%` }}></div>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-2">{dayName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-12 border border-slate-800/60 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-[#2F80FF]/10 rounded-full flex items-center justify-center mb-4">
                  <Activity size={32} className="text-[#4FA3FF]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Aptitude Progress Yet</h3>
                <p className="text-slate-400 mb-6 max-w-sm">Start practicing in the Aptitude module to see your advanced analytics, accuracy trends, and strongest topics here.</p>
                <Link to="/practice" className="py-2.5 px-6 bg-[#2F80FF] hover:bg-[#1D5BD8] text-white font-bold rounded-xl transition-colors">
                  Start Practicing
                </Link>
              </div>
            )}
            
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
