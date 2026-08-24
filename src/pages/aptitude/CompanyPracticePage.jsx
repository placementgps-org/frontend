import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Search, Target, Filter } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const COMPANIES = [
  'All Companies',
  'TCS',
  'Infosys',
  'Accenture',
  'Deloitte',
  'Cognizant',
  'Capgemini',
  'Wipro',
  'EY',
  'HCLTech',
  'Tech Mahindra',
  'IBM',
  'Zoho'
];

export default function CompanyPracticePage() {
  const { categoryId, topicId } = useParams();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState('All Companies');
  const [difficulty, setDifficulty] = useState('All');
  const [source, setSource] = useState('All');

  const handleStartPractice = () => {
    // Navigate to the quiz page with query params indicating it's a company practice
    navigate(`/practice/${categoryId}/${topicId}/quiz?isCompany=true&company=${company}&difficulty=${difficulty}&source=${source}`);
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage />
      
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/practice/${categoryId}/${topicId}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium mb-8"
        >
          <ArrowLeft size={16} />
          Back to Topic
        </button>

        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-[#2F80FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2F80FF]/20">
            <Building2 className="text-[#2F80FF]" size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Company Practice
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Test your readiness for specific corporate assessments. Choose verified historical questions or AI-generated questions based on company patterns.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 md:p-8 border border-slate-800/60 shadow-xl"
        >
          <div className="space-y-6">
            
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-[#4FA3FF]" /> Target Company
              </label>
              <select 
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#2F80FF] focus:ring-1 focus:ring-[#2F80FF]"
              >
                {COMPANIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-emerald-400" /> Difficulty Level
                </label>
                <select 
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="All">Mixed / All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <Filter size={16} className="text-amber-400" /> Question Source
                </label>
                <select 
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                >
                  <option value="All">All Sources</option>
                  <option value="Verified">Verified Actual Questions</option>
                  <option value="Company-Style AI">Company-Style AI Questions</option>
                </select>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={handleStartPractice}
                className="w-full py-4 bg-white text-black hover:bg-slate-200 font-bold text-lg rounded-xl shadow-xl shadow-white/5 transition-all flex items-center justify-center gap-2"
              >
                <Search size={20} />
                Find Questions & Start
              </button>
            </div>

          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
