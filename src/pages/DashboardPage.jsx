import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  LogOut,
  Code2,
  Map,
  FileCheck2,
  BookOpenCheck,
  Mic,
  ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingMockTestWidget from '../components/FloatingMockTestWidget';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardPage — Authenticated user dashboard.
 * Shows welcome message, profile card, and quick links to modules.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Get user's initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden relative">
      <Navbar onOpenLogin={() => {}} isAuthPage />
      <FloatingMockTestWidget onStartMockTest={() => navigate('/mock-test')} />

      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Welcome Section */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass-card rounded-2xl p-6 border border-slate-800/60 h-full">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#2F80FF]/30 shadow-lg shadow-[#2F80FF]/10"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2F80FF] to-[#1D5BD8] flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-[#2F80FF]/20">
                    {getInitials(user?.name)}
                  </div>
                )}
                <h2 className="text-lg font-bold text-white mt-3">{user?.name}</h2>
                <span className="text-xs text-slate-400 mt-0.5 capitalize">{user?.role || 'User'}</span>
              </div>

              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={14} className="text-[#4FA3FF] shrink-0" />
                  <span className="text-slate-300 truncate">{user?.email}</span>
                  {user?.emailVerified && (
                    <Shield size={12} className="text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={14} className="text-[#4FA3FF] shrink-0" />
                  <span className="text-slate-300">{user?.phone}</span>
                  {user?.phoneVerified && (
                    <Shield size={12} className="text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={14} className="text-[#4FA3FF] shrink-0" />
                  <span className="text-slate-300">Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-6 py-2.5 px-4 bg-slate-900/80 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 rounded-xl text-sm font-medium text-slate-300 hover:text-red-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </motion.div>

          {/* Modules Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <LayoutDashboard size={14} className="text-[#4FA3FF]" />
              Your Modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {modules.map((module, i) => (
                <Link
                  key={module.path}
                  to={module.path}
                  className="group"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                    className="glass-card rounded-xl p-5 border border-slate-800/60 cursor-pointer group-hover:border-[#2F80FF]/40 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <module.icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white group-hover:text-[#4FA3FF] transition-colors">
                          {module.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-[#4FA3FF] group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
