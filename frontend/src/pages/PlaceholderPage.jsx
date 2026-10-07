import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, LogIn, LayoutDashboard } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function PlaceholderPage({ title, description, icon: Icon, onOpenLogin }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] flex flex-col justify-between overflow-x-hidden">
      <Navbar onOpenLogin={onOpenLogin} />

      <main className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center my-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#2F80FF]/15 border border-[#2F80FF]/30 flex items-center justify-center text-[#4FA3FF] mx-auto shadow-xl shadow-[#2F80FF]/10">
            <Icon size={32} />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2F80FF]/15 border border-[#2F80FF]/30 text-xs font-semibold text-[#4FA3FF]">
            <Sparkles size={14} />
            <span>COMING SOON</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight gradient-heading">
            {title}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {description}
          </p>

          <div className="glass-card rounded-2xl p-8 border border-[#2F80FF]/20 max-w-md mx-auto space-y-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm font-semibold text-white">We're building this feature!</div>
                <p className="text-xs text-slate-400">
                  You're on our priority access list. Check back soon for the live launch!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to="/dashboard"
                    className="px-5 py-2.5 btn-glow rounded-xl text-xs font-bold text-white flex items-center gap-2"
                  >
                    <LayoutDashboard size={14} />
                    Back to Dashboard
                  </Link>
                  <Link
                    to="/"
                    className="px-5 py-2.5 btn-secondary-glow rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2"
                  >
                    <ArrowLeft size={14} />
                    Back to Home
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-white">Full Feature Launching Soon</div>
                <p className="text-xs text-slate-400">
                  Sign in today to get early access notifications as soon as this module goes live!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link
                    to="/"
                    className="px-5 py-2.5 btn-secondary-glow rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2"
                  >
                    <ArrowLeft size={14} />
                    Back to Home
                  </Link>
                  <button
                    onClick={onOpenLogin}
                    className="px-5 py-2.5 btn-glow rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn size={14} />
                    Sign In For Updates
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
