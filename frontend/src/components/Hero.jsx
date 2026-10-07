import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

/* ─── Animated Blue Particle Canvas ─── */
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
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.5 + 0.15,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(47, 128, 255, ${0.08 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
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

      animationId = requestAnimationFrame(drawParticles);
    };

    resize();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}

export default function Hero({ onStartJourney, onExploreFeatures }) {
  return (
    <section
      id="hero"
      className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden bg-[#05070F]"
    >
      {/* Animated Particle Canvas */}
      <ParticleBackground />

      {/* Background Gradient Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#2F80FF]/12 rounded-full blur-[160px] pointer-events-none animate-blob-blue" />
      <div className="absolute top-2/3 left-1/4 w-[400px] h-[400px] bg-[#4FA3FF]/8 rounded-full blur-[140px] pointer-events-none animate-blob-blue" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[500px] bg-[#1D5BD8]/10 rounded-full blur-[150px] pointer-events-none animate-blob-blue" style={{ animationDelay: '6s' }} />

      {/* Floating Abstract Shapes */}
      <div className="absolute top-20 left-[10%] w-16 h-16 border border-[#2F80FF]/20 rounded-lg rotate-45 animate-float-1 pointer-events-none" />
      <div className="absolute top-1/3 right-[8%] w-10 h-10 bg-[#2F80FF]/8 rounded-full animate-float-2 pointer-events-none" />
      <div className="absolute bottom-1/3 left-[15%] w-20 h-1 bg-gradient-to-r from-transparent via-[#2F80FF]/25 to-transparent animate-float-3 pointer-events-none" />
      <div className="absolute top-[60%] right-[18%] w-6 h-6 border-2 border-[#4FA3FF]/15 rounded-full animate-float-1 pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[15%] right-[25%] w-3 h-3 bg-[#2F80FF]/20 rounded-full animate-float-2 pointer-events-none" style={{ animationDelay: '4s' }} />
      <div className="absolute bottom-[20%] right-[35%] w-12 h-12 border border-[#2F80FF]/10 rounded-xl rotate-12 animate-float-3 pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* Radial Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(rgba(47, 128, 255, 0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[#2F80FF]/30 text-xs font-semibold text-[#4FA3FF] mb-8 shadow-lg shadow-[#2F80FF]/10"
        >
          <Sparkles size={14} className="text-[#4FA3FF] animate-pulse" />
          <span>AI-POWERED CAREER GUIDANCE PLATFORM</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F80FF] animate-ping" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-6"
        >
          The Smart Route to Your <br className="hidden sm:inline" />
          <span className="gradient-blue-text">Dream Career</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-slate-300 font-normal leading-relaxed mb-10"
        >
          Placement GPS is an AI-powered career guidance platform designed to simplify placement preparation. Assess your skills, receive a personalized roadmap, build an ATS-friendly resume, practice technical and aptitude questions, and discover high-quality free learning resources—all from one intelligent platform.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={onStartJourney}
            className="w-full sm:w-auto px-8 py-4 btn-glow rounded-xl text-base font-bold text-white flex items-center justify-center gap-3 group cursor-pointer"
          >
            Start Your Journey
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onExploreFeatures}
            className="w-full sm:w-auto px-8 py-4 btn-secondary-glow rounded-xl text-base font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            Explore Features
          </button>
        </motion.div>


      </div>
    </section>
  );
}
