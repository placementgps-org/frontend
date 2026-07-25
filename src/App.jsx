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

      {/* ── Protected Routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* ── Feature Placeholder Routes ── */}
      <Route
        path="/practice"
        element={
          <PlaceholderPage
            title="Practice Arena"
            description="Practice coding, aptitude, logical reasoning, verbal ability, and technical MCQs with detailed explanations. Coming soon."
            icon={Code2}
            onOpenLogin={openLogin}
          />
        }
      />
      <Route
        path="/roadmap"
        element={
          <PlaceholderPage
            title="Personalized Roadmap"
            description="Receive a customized preparation plan based on your strengths, weaknesses, and dream company. Coming soon."
            icon={Map}
            onOpenLogin={openLogin}
          />
        }
      />
      <Route
        path="/resume-analyser"
        element={
          <PlaceholderPage
            title="Resume Analyser"
            description="Upload your resume and receive AI-powered ATS optimization suggestions. Coming soon."
            icon={FileCheck2}
            onOpenLogin={openLogin}
          />
        }
      />
      <Route
        path="/free-courses"
        element={
          <PlaceholderPage
            title="Free Courses"
            description="Discover curated YouTube videos, documentation, roadmaps, and courses—all completely free. Coming soon."
            icon={BookOpenCheck}
            onOpenLogin={openLogin}
          />
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

