import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: 'Is Placement GPS completely free?',
      answer:
        'Yes. Placement GPS offers free learning resources, personalized roadmaps, resume analysis, and practice materials to help students prepare effectively. Additional premium features may be introduced in the future.',
    },
    {
      question: 'How is the learning roadmap personalized?',
      answer:
        'The roadmap is generated after analyzing your current skills, strengths, weaknesses, and target job role. It recommends a step-by-step learning path with free resources.',
    },
    {
      question: 'Can Placement GPS improve my resume?',
      answer:
        'Yes. The AI Resume Analyzer evaluates your resume for ATS compatibility, project quality, formatting, technical skills, and provides actionable suggestions to improve it.',
    },
    {
      question: 'What types of practice content are available?',
      answer:
        'Students can practice aptitude, logical reasoning, verbal ability, technical MCQs, coding challenges, and company-specific interview questions with detailed explanations.',
    },
    {
      question: 'Will I get feedback after the AI Mock Interview?',
      answer:
        'Yes. The AI Mock Interview evaluates your responses, communication, confidence, and technical understanding, then provides personalized suggestions for improvement.',
    },
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative z-10 bg-[#05070F]">
      {/* Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#2F80FF]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight gradient-heading mb-4">
            Frequently Asked <span className="gradient-blue-text">Questions</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal">
            Everything you need to know about Placement GPS and how it accelerates your career.
          </p>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-[#2F80FF]/50 shadow-xl shadow-[#2F80FF]/10 !transform-none'
                    : ''
                }`}
                style={isOpen ? { transform: 'none' } : {}}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-white hover:text-[#4FA3FF] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={20} className="text-[#2F80FF] shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-[#4FA3FF] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-300 leading-relaxed font-normal border-t border-slate-800/70">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
