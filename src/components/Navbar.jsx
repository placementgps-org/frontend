import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenLogin, isAuthPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'aptitude Practice', path: '/practice' },
    { label: 'Roadmap', path: '/roadmap' },
    { label: 'Resume Analyser', path: '/resume-analyser' },
    { label: 'Free Courses', path: '/free-courses' },
    { label: 'Interview Practice', path: '/interview-practice' },
  ];

  const handleNavClick = (item) => {
    setMobileMenuOpen(false);
    if (item.path === '/' && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    navigate(item.path);
  };

  const handleLoginClick = () => {
    if (onOpenLogin) {
      onOpenLogin();
    } else {
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo (ICON ONLY — no text, no tagline) */}
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(navItems[0]);
            }}
            className="flex items-center group focus:outline-none shrink-0"
            aria-label="Placement GPS Home"
          >
            <img
              src="/logo_new.jpg"
              alt="Placement GPS"
              className="h-[40px] w-[40px] object-contain rounded-lg drop-shadow-[0_0_12px_rgba(47,128,255,0.35)] transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Centered Navigation Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/55 p-1.5 rounded-full border border-white/5 backdrop-blur-lg shadow-inner">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${isActive
                      ? 'bg-[#2F80FF]/90 text-white shadow-md shadow-[#2F80FF]/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right: Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* User Avatar + Name */}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 hover:border-[#2F80FF]/30 transition-all group"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#2F80FF]/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#2F80FF] to-[#1D5BD8] flex items-center justify-center text-[10px] font-bold text-white">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-red-400 bg-slate-900/60 border border-slate-800 hover:border-red-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </>
            ) : !isAuthPage ? (
              <button
                onClick={handleLoginClick}
                className="px-5 py-2.5 btn-glow rounded-full text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
              >
                <LogIn size={15} />
                Login
              </button>
            ) : null}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F80FF] to-[#1D5BD8] flex items-center justify-center text-[10px] font-bold text-white"
              >
                {getInitials(user.name)}
              </Link>
            ) : !isAuthPage ? (
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 btn-glow rounded-full text-xs font-bold text-white cursor-pointer"
              >
                Login
              </button>
            ) : null}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-b border-slate-800 px-4 py-5 mt-2 animate-fade-in space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`block w-full text-left px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${location.pathname === item.path
                  ? 'text-[#4FA3FF] bg-[#2F80FF]/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
            >
              {item.label}
            </button>
          ))}

          {/* Mobile: Dashboard & Logout links when authenticated */}
          {isAuthenticated && (
            <>
              <div className="border-t border-slate-800 my-2" />
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                Dashboard
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

