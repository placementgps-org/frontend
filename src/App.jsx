import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Code2, Map, FileCheck2, BookOpenCheck, Mic, Award } from 'lucide-react';
import LandingPage from './pages/LandingPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Aptitude Practice Pages
import AptitudeLandingPage from './pages/aptitude/AptitudeLandingPage';
import CategoryPage from './pages/aptitude/CategoryPage';
import TopicLearnPage from './pages/aptitude/TopicLearnPage';
import PracticeQuizPage from './pages/aptitude/PracticeQuizPage';
import CompanyPracticePage from './pages/aptitude/CompanyPracticePage';
import FreeCoursesPage from './pages/courses/FreeCoursesPage';
import CareerMapLandingPage from './pages/careers/CareerMapLandingPage';
import RoadmapPage from './pages/roadmap/RoadmapPage';
import CareerAIAdvisor from './pages/careers/CareerAIAdvisor';
import ResumeAnalyserPage from './pages/resume/ResumeAnalyserPage';
import CodingWorkspacePage from './pages/coding/CodingWorkspacePage';

export default function App() {
  const navigate = useNavigate();

  // Navigate to login page instead of opening a modal
  const openLogin = () => navigate('/login');

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage onOpenLogin={openLogin} />}
      />

      {/* ── Auth Routes ── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Career Map / AI Routes */}
      <Route path="/career-map" element={
        <ProtectedRoute>
          <CareerMapLandingPage />
        </ProtectedRoute>
      } />
      <Route path="/career-map/ai-advisor" element={
        <ProtectedRoute>
          <CareerAIAdvisor />
        </ProtectedRoute>
      } />

      {/* ── Protected Routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── Aptitude Practice Routes ── */}
      <Route
        path="/practice"
        element={<AptitudeLandingPage />}
      />
      <Route
        path="/practice/:categoryId"
        element={<CategoryPage />}
      />
      <Route
        path="/practice/:categoryId/:topicId"
        element={<TopicLearnPage />}
      />
      <Route
        path="/practice/:categoryId/:topicId/quiz"
        element={
          <ProtectedRoute>
            <PracticeQuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/:categoryId/:topicId/company"
        element={
          <ProtectedRoute>
            <CompanyPracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/free-courses"
        element={<FreeCoursesPage />}
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <RoadmapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume-analyser"
        element={
          <ProtectedRoute>
            <ResumeAnalyserPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coding-practice"
        element={
          <ProtectedRoute>
            <CodingWorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coding-practice/:challengeId"
        element={
          <ProtectedRoute>
            <CodingWorkspacePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/interview-practice"
        element={
          <PlaceholderPage
            title="Interview Practice"
            description="Practice HR and technical interviews with an intelligent AI interviewer, receive real-time feedback, improve your communication skills, and prepare confidently for placements. Coming soon."
            icon={Mic}
            onOpenLogin={openLogin}
          />
        }
      />
      <Route
        path="/mock-test"
        element={
          <PlaceholderPage
            title="Mock Test — Coming Soon"
            description="We're building this feature to give you AI-powered placement evaluations and scorecards. Check back soon!"
            icon={Award}
            onOpenLogin={openLogin}
          />
        }
      />
    </Routes>
  );
}

