import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Practice', path: '/practice' },
    { label: 'Roadmap', path: '/roadmap' },
    { label: 'Resume Analyzer', path: '/resume-analyser' },
    { label: 'Free Courses', path: '/free-courses' },
  ];

  const handleNavClick = (path) => {
    if (path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    navigate(path);
  };

  return (
    <footer className="bg-[#03050B] border-t border-slate-800/80 pt-16 pb-10 relative z-10 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand: Logo Icon + "Placement GPS" */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Placement GPS"
                className="h-[38px] w-[38px] object-contain drop-shadow-[0_0_10px_rgba(47,128,255,0.3)]"
              />
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#4FA3FF] transition-colors">
                Placement GPS
              </span>
            </Link>
            <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-sm">
              Your Career Compass in the Age of AI
            </p>
            <p className="text-xs text-slate-400 max-w-sm leading-normal">
              Empowering students with personalized preparation roadmaps, AI resume optimization, and diagnostic practice.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <button
                    onClick={() => handleNavClick(link.path)}
                    className="hover:text-[#4FA3FF] transition-colors cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Contact
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-[#4FA3FF] transition-colors"
              >
                <Github size={16} className="text-[#2F80FF]" />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 hover:text-[#4FA3FF] transition-colors"
              >
                <Linkedin size={16} className="text-[#2F80FF]" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:support@placementgps.ai"
                className="flex items-center gap-2.5 hover:text-[#4FA3FF] transition-colors"
              >
                <Mail size={16} className="text-[#2F80FF]" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© 2026 Placement GPS</div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
