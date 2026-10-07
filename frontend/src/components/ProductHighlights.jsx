import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Map, Code2, FileCheck2, BookOpenCheck, BotMessageSquare } from 'lucide-react';

export default function ProductHighlights() {
  const highlights = [
    {
      icon: BarChart3,
      title: 'Skill Assessment',
      description:
        'Evaluate your aptitude, reasoning, technical knowledge, and communication skills with AI-powered assessments.',
    },
    {
      icon: Map,
      title: 'Personalized Roadmap',
      description:
        'Receive a customized preparation plan based on your strengths, weaknesses, and dream company.',
    },
    {
      icon: Code2,
      title: 'Practice Arena',
      description:
        'Practice coding, aptitude, logical reasoning, verbal ability, and technical MCQs with detailed explanations.',
    },
    {
      icon: FileCheck2,
      title: 'Resume Analyzer',
      description:
        'Upload your resume and receive AI-powered ATS optimization suggestions.',
    },
    {
      icon: BookOpenCheck,
      title: 'Free Learning Resources',
      description:
        'Discover curated YouTube videos, documentation, roadmaps, and courses—all completely free.',
    },
    {
      icon: BotMessageSquare,
      title: 'AI Mock Interview',
      description:
        'Experience realistic HR and technical interviews with instant feedback to improve confidence and performance.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section id="highlights" className="py-24 relative z-10 bg-[#05070F]">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2F80FF]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-heading mb-4">
            Product <span className="gradient-blue-text">Highlights</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal">
            Everything you need for placement preparation in one intelligent platform.
          </p>
        </motion.div>

        {/* 6 Premium Glass Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {highlights.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="glass-card rounded-2xl p-8 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Blue Hover Glow */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#2F80FF]/0 rounded-full blur-2xl group-hover:bg-[#2F80FF]/20 transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#2F80FF]/15 border border-[#2F80FF]/30 flex items-center justify-center text-[#4FA3FF] mb-6 group-hover:scale-110 group-hover:bg-[#2F80FF]/25 group-hover:shadow-lg group-hover:shadow-[#2F80FF]/20 transition-all duration-300">
                    <IconComponent size={24} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#4FA3FF] transition-colors duration-300">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Neon Accent Bar */}
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#2F80FF] to-transparent mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
