import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Code, Globe, Smartphone, Sparkles, BrainCircuit, Database, Cloud, Activity, Lock, Wifi, Server, CheckSquare, Layers, Radio, Bot, Gamepad2, Blocks, Hexagon, Glasses, TestTube, Briefcase, HelpCircle, Factory, ChevronRight } from 'lucide-react';

const careerDomains = [
  { id: 'software-engineer', name: 'Software Engineer', icon: Code, desc: 'Build and maintain core software applications.' },
  { id: 'full-stack-developer', name: 'Full Stack Developer', icon: Globe, desc: 'Create end-to-end web applications.' },
  { id: 'mobile-developer', name: 'Mobile Developer', icon: Smartphone, desc: 'Develop for iOS and Android.' },
  { id: 'ai-engineer', name: 'AI Engineer', icon: Sparkles, desc: 'Build intelligent systems.' },
  { id: 'machine-learning-engineer', name: 'Machine Learning', icon: BrainCircuit, desc: 'Design algorithms that learn.' },
  { id: 'data-scientist', name: 'Data Scientist', icon: TestTube, desc: 'Extract insights from data.' },
  { id: 'data-engineer', name: 'Data Engineer', icon: Database, desc: 'Build data pipelines.' },
  { id: 'cloud-architect', name: 'Cloud Architect', icon: Cloud, desc: 'Design scalable cloud infrastructure.' },
  { id: 'devops-engineer', name: 'DevOps Engineer', icon: Activity, desc: 'Bridge development and operations.' },
  { id: 'cybersecurity-engineer', name: 'Cybersecurity Engineer', icon: Lock, desc: 'Protect systems and data.' },
  { id: 'network-engineer', name: 'Network Engineer', icon: Wifi, desc: 'Design computer networks.' },
  { id: 'qa-engineer', name: 'QA Engineer', icon: CheckSquare, desc: 'Ensure software quality.' },
];

export default function CareerSelector({ onSelectCareer }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
          Choose Your Target Career
        </h1>
        <p className="text-slate-400">
          Select a role below to generate your personalized learning roadmap. Your roadmap will guide you step-by-step to becoming placement-ready.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {careerDomains.map((career, index) => {
          const Icon = career.icon;
          return (
            <motion.div
              key={career.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectCareer(career.id)}
              className="glass-card rounded-2xl p-6 border border-slate-800/60 hover:border-[#2F80FF]/50 cursor-pointer group transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2F80FF]/10 flex items-center justify-center border border-[#2F80FF]/20 group-hover:scale-110 transition-transform shrink-0">
                  <Icon className="text-[#4FA3FF]" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#4FA3FF] transition-colors">
                    {career.name}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {career.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 text-center glass-card rounded-2xl p-8 border border-slate-800/60 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-white mb-2">Not sure what to choose?</h3>
        <p className="text-slate-400 mb-6">
          Tell our AI what you like to do, and it will recommend the perfect tech career for you.
        </p>
        <button 
          onClick={() => navigate('/career-map/ai-advisor')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2F80FF]/10 hover:bg-[#2F80FF]/20 text-[#4FA3FF] rounded-xl font-medium transition-colors"
        >
          Ask Placement GPS AI <Sparkles size={16} className="text-[#4FA3FF]" />
        </button>
      </div>
    </div>
  );
}
