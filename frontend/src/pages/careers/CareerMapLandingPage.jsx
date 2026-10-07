import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, Code, Globe, Smartphone, Cpu, BrainCircuit, Database, Cloud, Activity, Lock, Wifi, Server, CheckSquare, Layers, Settings, Radio, Bot, Gamepad2, Blocks, Hexagon, Glasses, TestTube, Briefcase, HelpCircle, Factory } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// The 27 Top-Level Domains
const careerDomains = [
  { id: 'software-development', name: 'Software Development', icon: Code, description: 'Build and maintain software applications and systems.', exampleRoles: 'Software Engineer, Backend Developer' },
  { id: 'web-development', name: 'Web Development', icon: Globe, description: 'Create engaging and responsive websites and web applications.', exampleRoles: 'Frontend Developer, Full Stack Developer' },
  { id: 'mobile-development', name: 'Mobile Development', icon: Smartphone, description: 'Develop applications for iOS, Android, and cross-platform devices.', exampleRoles: 'Android Developer, iOS Developer' },
  { id: 'ai', name: 'AI', icon: Sparkles, description: 'Build intelligent systems that simulate human intelligence.', exampleRoles: 'AI Engineer, AI Researcher' },
  { id: 'machine-learning', name: 'Machine Learning', icon: BrainCircuit, description: 'Design algorithms that allow computers to learn from data.', exampleRoles: 'ML Engineer, NLP Engineer' },
  { id: 'data-science', name: 'Data Science', icon: TestTube, description: 'Extract meaningful insights from complex data sets.', exampleRoles: 'Data Scientist, Data Analyst' },
  { id: 'data-engineering', name: 'Data Engineering', icon: Database, description: 'Design and build systems for collecting, storing, and analyzing data at scale.', exampleRoles: 'Data Engineer, Big Data Engineer' },
  { id: 'database', name: 'Database', icon: Database, description: 'Manage, optimize, and secure database systems.', exampleRoles: 'Database Administrator, SQL Developer' },
  { id: 'cloud', name: 'Cloud', icon: Cloud, description: 'Design and manage scalable cloud computing infrastructure.', exampleRoles: 'Cloud Engineer, Cloud Architect' },
  { id: 'devops', name: 'DevOps', icon: Activity, description: 'Bridge the gap between development and operations to improve software delivery.', exampleRoles: 'DevOps Engineer, Release Manager' },
  { id: 'sre', name: 'SRE', icon: Activity, description: 'Apply software engineering practices to infrastructure and operations.', exampleRoles: 'Site Reliability Engineer' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: Lock, description: 'Protect systems, applications, networks, and data from cyber threats.', exampleRoles: 'Cybersecurity Engineer, SOC Analyst' },
  { id: 'networking', name: 'Networking', icon: Wifi, description: 'Design, implement, and manage computer networks.', exampleRoles: 'Network Engineer, Network Administrator' },
  { id: 'infrastructure', name: 'Infrastructure', icon: Server, description: 'Manage the underlying hardware and software IT infrastructure.', exampleRoles: 'System Administrator, IT Engineer' },
  { id: 'software-testing', name: 'Software Testing', icon: CheckSquare, description: 'Ensure software quality through manual and automated testing.', exampleRoles: 'QA Engineer, SDET' },
  { id: 'architecture', name: 'Architecture', icon: Layers, description: 'Design high-level structure and architecture of software systems.', exampleRoles: 'Software Architect, Solutions Architect' },
  { id: 'embedded', name: 'Embedded', icon: Cpu, description: 'Develop software for embedded systems and microcontrollers.', exampleRoles: 'Embedded Systems Engineer' },
  { id: 'iot', name: 'IoT', icon: Radio, description: 'Build systems connecting physical devices to the internet.', exampleRoles: 'IoT Developer, IoT Architect' },
  { id: 'robotics', name: 'Robotics', icon: Bot, description: 'Design and program robotic systems and automation.', exampleRoles: 'Robotics Engineer' },
  { id: 'game-development', name: 'Game Development', icon: Gamepad2, description: 'Create interactive games for various platforms.', exampleRoles: 'Game Developer, Unity Developer' },
  { id: 'blockchain', name: 'Blockchain/Web3', icon: Blocks, description: 'Develop decentralized applications and smart contracts.', exampleRoles: 'Blockchain Developer, Smart Contract Engineer' },
  { id: 'hardware-vlsi', name: 'Hardware/VLSI', icon: Hexagon, description: 'Design integrated circuits, chips, and hardware components.', exampleRoles: 'VLSI Engineer, Hardware Design Engineer' },
  { id: 'ar-vr', name: 'AR/VR/XR', icon: Glasses, description: 'Build immersive augmented and virtual reality experiences.', exampleRoles: 'AR/VR Developer' },
  { id: 'research-hpc', name: 'Research/HPC', icon: TestTube, description: 'Conduct advanced research and work with High-Performance Computing.', exampleRoles: 'Research Scientist, HPC Engineer' },
  { id: 'enterprise-tech', name: 'Enterprise Tech', icon: Briefcase, description: 'Develop and manage large-scale enterprise software systems like SAP or Salesforce.', exampleRoles: 'Salesforce Developer, SAP Consultant' },
  { id: 'technical-support', name: 'Technical Support', icon: HelpCircle, description: 'Assist users and clients with technical issues and product support.', exampleRoles: 'Technical Support Engineer, IT Helpdesk' },
  { id: 'specialized-industry', name: 'Specialized Industry Tech', icon: Factory, description: 'Tech roles specific to industries like FinTech, HealthTech, or Automotive.', exampleRoles: 'FinTech Developer, BioInformatics Engineer' },
];

export default function CareerMapLandingPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/career-map/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage={false} />
      
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight gradient-heading mb-6">
            Explore Your Technology Career
          </h1>
          <p className="text-slate-400 text-lg">
            Discover what technology professionals actually do, find careers that match your interests, and build a roadmap to become placement-ready.
          </p>
        </motion.div>

        {/* Discovery Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
          
          {/* A. Search Careers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card rounded-3xl p-8 border border-slate-800/60 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
              <Search size={120} />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <Search className="text-[#2F80FF]" /> Search Careers
              </h2>
              <p className="text-slate-400 mb-8">
                Know what you're looking for? Search across all domains, roles, and skills.
              </p>
              
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="e.g. Cybersecurity Engineer, Python Developer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-[#2F80FF] focus:ring-1 focus:ring-[#2F80FF] transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-[#2F80FF] hover:bg-[#1D5BD8] text-white rounded-xl px-4 transition-colors flex items-center justify-center"
                >
                  <Search size={20} />
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-slate-500">Popular:</span>
                {['Cybersecurity Engineer', 'Data Scientist', 'Cloud Engineer'].map(term => (
                  <button 
                    key={term} 
                    onClick={() => setSearchTerm(term)}
                    className="text-xs text-slate-400 hover:text-[#2F80FF] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* B. AI Career Advisor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card rounded-3xl p-8 border border-[#2F80FF]/30 bg-gradient-to-br from-[#2F80FF]/10 to-transparent relative overflow-hidden group cursor-pointer hover:border-[#2F80FF]/60 transition-colors"
            onClick={() => navigate('/career-map/ai-advisor')}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:rotate-12 transition-transform duration-500 text-[#4FA3FF]">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3 text-white">
                <Sparkles className="text-[#4FA3FF]" /> Ask Placement GPS AI
              </h2>
              <p className="text-slate-300 mb-8 max-w-md">
                Not sure which career is right for you? Tell us what you like, what you know, and what you want to achieve.
              </p>
              
              <div className="mt-auto space-y-3">
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 italic">
                  "I like hacking. What career should I choose?"
                </div>
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 italic">
                  "I know Python and SQL. What jobs can I apply for?"
                </div>
              </div>
              
              <div className="mt-6">
                <span className="inline-flex items-center gap-2 text-[#4FA3FF] font-medium group-hover:translate-x-2 transition-transform">
                  Start Chat <Sparkles size={16} />
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* C. Browse Career Domains */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Browse Career Domains</h2>
            <p className="text-slate-400">Explore the 27 primary technology sectors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerDomains.map((domain, index) => {
            const Icon = domain.icon;
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (index % 6) * 0.1 }}
                onClick={() => navigate(`/career-map/domain/${domain.id}`)}
                className="glass-card rounded-2xl p-6 border border-slate-800/60 hover:border-[#2F80FF]/40 transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2F80FF]/20 to-[#1D5BD8]/20 flex items-center justify-center border border-[#2F80FF]/30 group-hover:scale-110 transition-transform">
                    <Icon className="text-[#4FA3FF]" size={24} />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{domain.name}</h3>
                <p className="text-sm text-slate-400 mb-6 flex-grow">{domain.description}</p>
                
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Example careers:</p>
                  <p className="text-sm text-slate-300 font-medium truncate">{domain.exampleRoles}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
