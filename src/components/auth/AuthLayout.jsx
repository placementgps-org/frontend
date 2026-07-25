import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';

/**
 * Animated Particle Canvas — reused from Hero.jsx pattern.
 * Creates floating blue particles with connecting lines.
 */
function ParticleBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 50);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.5 + 0.3,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: Math.random() * 0.4 + 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(47, 128, 255, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 163, 255, ${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    const handleResize = () => { resize(); createParticles(); };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}

/**
 * AuthLayout — Shared layout for all authentication pages.
 * Provides the dark themed background with particle canvas, floating shapes,
 * gradient glows, and a centered glass card container.
 *
 * Props:
 *   children  — The form content inside the glass card
 *   title     — Page heading
 *   subtitle  — Description text under heading
 *   icon      — Lucide icon component for the header badge
 *   maxWidth  — Optional max width class (default: max-w-md)
 */
export default function AuthLayout({ children, title, subtitle, icon: Icon, maxWidth = 'max-w-md' }) {
  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden relative flex flex-col">
      {/* Navbar — Login button navigates to /login */}
      <Navbar onOpenLogin={() => {}} isAuthPage />

      <main className="flex-1 relative flex items-center justify-center pt-24 pb-16 px-4 sm:px-6">
        {/* Particle Canvas */}
        <ParticleBackground />

        {/* Background Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2F80FF]/10 rounded-full blur-[160px] pointer-events-none animate-blob-blue" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#4FA3FF]/6 rounded-full blur-[140px] pointer-events-none animate-blob-blue" style={{ animationDelay: '4s' }} />

        {/* Floating Abstract Shapes */}
        <div className="absolute top-20 left-[8%] w-14 h-14 border border-[#2F80FF]/15 rounded-lg rotate-45 animate-float-1 pointer-events-none" />
        <div className="absolute top-1/3 right-[6%] w-8 h-8 bg-[#2F80FF]/8 rounded-full animate-float-2 pointer-events-none" />
        <div className="absolute bottom-1/3 left-[12%] w-16 h-1 bg-gradient-to-r from-transparent via-[#2F80FF]/20 to-transparent animate-float-3 pointer-events-none" />

        {/* Radial Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(rgba(47, 128, 255, 0.3) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Glass Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className={`relative w-full ${maxWidth} glass-modal rounded-2xl p-8 text-white z-10 overflow-hidden`}
        >
          {/* Ambient Corner Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-6">
            {Icon && (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-3">
                <Icon size={24} />
              </div>
            )}
            <h1 className="text-2xl font-bold tracking-tight gradient-heading">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>

          {children}
        </motion.div>
      </main>
    </div>
  );
}
