import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck2,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ResumeUploadCard from '../../components/resume/ResumeUploadCard';
import ScoreOverviewCards from '../../components/resume/ScoreOverviewCards';
import AtsCompatibilityCard from '../../components/resume/AtsCompatibilityCard';
import SkillsAnalysisCard from '../../components/resume/SkillsAnalysisCard';
import ProjectsAnalysisCard from '../../components/resume/ProjectsAnalysisCard';
import ProfileEvaluationCard from '../../components/resume/ProfileEvaluationCard';
import SuitableRolesCard from '../../components/resume/SuitableRolesCard';
import InternshipReadinessCard from '../../components/resume/InternshipReadinessCard';
import ThingsToImproveCard from '../../components/resume/ThingsToImproveCard';
import CourseRecommendationsCard from '../../components/resume/CourseRecommendationsCard';
import AiCareerAssistantCard from '../../components/resume/AiCareerAssistantCard';
import { resumeService } from '../../services/resumeService';

const LOADING_STEPS = [
  'Uploading your resume securely...',
  'Extracting and parsing document structure...',
  'Analysing technical and soft skills...',
  'Auditing ATS compatibility & recruiter keywords...',
  'Evaluating practical projects and measurable impact...',
  'Matching optimal career roles and internship opportunities...',
  'Identifying learning gaps and prerequisite competencies...',
  'Curating verified free courses from database...',
  'Finalizing your AI Resume Analysis Report...'
];

export default function ResumeAnalyserPage() {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [error, setError] = useState(null);
  const evaluateCourseRef = useRef(null);

  // Fetch existing active resume on load
  const fetchMyResume = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeService.getMyResume();
      if (res && res.hasResume && res.data) {
        setResumeData(res.data);
      } else {
        setResumeData(null);
      }
    } catch (err) {
      console.warn('[ResumeAnalyserPage] Fetch error:', err.message);
      // Non-blocking error for initial load
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyResume();
  }, [fetchMyResume]);

  // Handle Resume Upload & Multi-step loading
  const handleUploadResume = async (file) => {
    setIsUploading(true);
    setError(null);
    setLoadingStepIndex(0);

    // Step cycle timer
    const stepInterval = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 1800);

    try {
      const res = await resumeService.uploadResume(file);
      if (res && res.success && res.data) {
        setResumeData(res.data);
      } else {
        throw new Error(res?.message || 'Failed to analyze resume.');
      }
    } catch (err) {
      console.error('[ResumeAnalyserPage] Upload error:', err);
      setError(err.message || 'Unable to analyze resume. Please try uploading again.');
    } finally {
      clearInterval(stepInterval);
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to clear your current resume analysis?')) return;
    try {
      await resumeService.deleteResume();
      setResumeData(null);
    } catch (err) {
      alert(err.message || 'Error clearing resume.');
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage={false} />

      <main className="flex-grow pt-24 pb-20 w-full flex flex-col">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">

          {/* ── PAGE HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
                <FileCheck2 size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Resume Analyser</h1>
                <p className="text-slate-400 text-sm mt-0.5">
                  In-depth ATS compatibility, skill gap diagnosis, role matching, and personalized free course curation
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── INITIAL PAGE LOADING ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 border-4 border-slate-700 border-t-[#2F80FF] rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading your resume evaluation...</p>
            </div>
          )}

          {/* ── UPLOADING & ANALYSING STATE (ANIMATED MULTI-STEP LOADER) ── */}
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-10 sm:p-14 border border-[#2F80FF]/40 bg-slate-950/90 text-center flex flex-col items-center justify-center my-8 shadow-[0_0_50px_rgba(47,128,255,0.15)] relative overflow-hidden"
            >
              {/* Background radiant animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2F80FF]/10 via-[#9A5BFF]/10 to-[#2F80FF]/10 animate-pulse pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2F80FF]/20 to-[#9A5BFF]/20 border border-[#2F80FF]/40 text-[#4FA3FF] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(47,128,255,0.25)]">
                  <Sparkles size={32} className="animate-bounce" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Resume</h3>
                <p className="text-slate-400 text-xs mb-6">
                  Our Gemini AI evaluation engine is performing a comprehensive multi-dimensional audit.
                </p>

                {/* Step indicator */}
                <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5 flex items-center gap-3">
                  <Loader2 size={18} className="text-[#2F80FF] animate-spin shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold text-slate-200 text-left truncate">
                    {LOADING_STEPS[loadingStepIndex]}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2F80FF] via-[#9A5BFF] to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.round(((loadingStepIndex + 1) / LOADING_STEPS.length) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-2 font-mono">
                  Step {loadingStepIndex + 1} of {LOADING_STEPS.length}
                </span>
              </div>
            </motion.div>
          )}

          {/* ── ERROR NOTICE ── */}
          {!isUploading && error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-xs font-medium text-white transition-colors shrink-0"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* ── MAIN CONTENT (UPLOAD ZONE OR DASHBOARD) ── */}
          {!loading && !isUploading && (
            <>
              {/* Upload Card */}
              <ResumeUploadCard
                onUpload={handleUploadResume}
                isUploading={isUploading}
                existingResume={resumeData}
                onDelete={handleDeleteResume}
              />

              {/* Complete AI Analysis Dashboard */}
              {resumeData && resumeData.analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* ✨ AI Career Assistant (Compact by default, Expandable on demand) */}
                  <AiCareerAssistantCard
                    resumeData={resumeData}
                    onEvaluateCourseRef={evaluateCourseRef}
                  />

                  {/* 1. Score Overview & Overall Impression */}
                  <ScoreOverviewCards analysis={resumeData.analysis} />

                  {/* 2. ATS Compatibility */}
                  <AtsCompatibilityCard atsCompatibility={resumeData.analysis.atsCompatibility} />

                  {/* 3. Skills Analysis */}
                  <SkillsAnalysisCard skillsAnalysis={resumeData.analysis.skillsAnalysis} />

                  {/* 4. Projects Analysis */}
                  <ProjectsAnalysisCard projectsAnalysis={resumeData.analysis.projectsAnalysis} />

                  {/* 5. Profile Evaluation (Education / Certifications / Experience) */}
                  <ProfileEvaluationCard profileEvaluation={resumeData.analysis.profileEvaluation} />

                  {/* 6. Suitable Roles */}
                  <SuitableRolesCard suitableRoles={resumeData.analysis.suitableRoles} />

                  {/* 7. Internship Readiness */}
                  <InternshipReadinessCard internshipReadiness={resumeData.analysis.internshipReadiness} />

                  {/* 8. Actionable Things To Improve */}
                  <ThingsToImproveCard thingsToImprove={resumeData.analysis.thingsToImprove} />

                  {/* 9. Recommended Free Courses (from MongoDB) */}
                  <CourseRecommendationsCard
                    courseRecommendations={resumeData.analysis.courseRecommendations}
                    onEvaluateCourse={(course) => evaluateCourseRef.current?.(course)}
                  />
                </motion.div>
              )}
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
