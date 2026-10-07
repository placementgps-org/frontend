import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CareerSelector from './CareerSelector';
import RoadmapDashboard from './RoadmapDashboard';
import { roadmapService } from '../../services/roadmapService';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoadmapPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [savingTopics, setSavingTopics] = useState(new Set());

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const result = await roadmapService.getRoadmap();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleSelectCareer = async (careerId) => {
    try {
      await roadmapService.updateTargetCareer(careerId);
      await fetchRoadmap();
    } catch (err) {
      alert(err.message || 'Error selecting career');
    }
  };

  const handleTopicStatusChange = async (topicId, status) => {
    if (savingTopics.has(topicId)) return;

    setSavingTopics(prev => new Set(prev).add(topicId));
    const backupData = data;

    try {
      // Optimistic UI update with strict deep cloning
      const updatedData = { ...data };
      if (updatedData.stages) {
        let oldStatus = '';
        updatedData.stages = updatedData.stages.map(stage => {
          const newStage = { ...stage };
          let stageCompletedCount = newStage.completedCount;
          
          newStage.topics = newStage.topics.map(t => {
            if (t.id === topicId) {
              oldStatus = t.status;
              if (oldStatus !== 'COMPLETED' && status === 'COMPLETED') {
                updatedData.completedCount++;
                stageCompletedCount++;
              } else if (oldStatus === 'COMPLETED' && status !== 'COMPLETED') {
                updatedData.completedCount--;
                stageCompletedCount--;
              }
              return { ...t, status };
            }
            return t;
          });
          
          newStage.completedCount = stageCompletedCount;
          return newStage;
        });
        
        updatedData.overallReadiness = updatedData.totalTopics === 0 ? 0 : Math.round((updatedData.completedCount / updatedData.totalTopics) * 100);
      }
      setData(updatedData);

      // Backend sync
      await roadmapService.updateTopicProgress(topicId, status);
    } catch (err) {
      alert('Unable to save your progress. Please try again.');
      setData(backupData); // Revert on failure
    } finally {
      setSavingTopics(prev => {
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  };

  const handleChangeCareer = () => {
    // We visually reset hasCareer to let them select again, but don't delete DB yet.
    setData(prev => ({ ...prev, hasCareer: false }));
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage={false} />
      
      <main className="flex-grow pt-24 pb-20 w-full flex flex-col">
        {loading && !data ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-700 border-t-[#2F80FF] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex-grow flex items-center justify-center px-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center text-red-400 max-w-md">
              {error}
              <button 
                onClick={fetchRoadmap}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm transition-colors block w-full"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data && data.hasCareer ? (
          <AnimatePresence mode="wait">
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex-grow"
            >
              <RoadmapDashboard 
                data={data} 
                savingTopics={savingTopics}
                onTopicStatusChange={handleTopicStatusChange} 
                onChangeCareer={handleChangeCareer}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="selector"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex-grow"
            >
              <CareerSelector onSelectCareer={handleSelectCareer} />
            </motion.div>
          </AnimatePresence>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
