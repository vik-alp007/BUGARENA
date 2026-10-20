import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { ChallengeExplorerPage } from './pages/ChallengeExplorerPage.jsx';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage.jsx';
import { GlitchLabPage } from './pages/GlitchLabPage.jsx';
import { SubmitReportPage } from './pages/SubmitReportPage.jsx';
import { MyReportsPage } from './pages/MyReportsPage.jsx';
import { LeaderboardPage } from './pages/LeaderboardPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/challenges" element={<ChallengeExplorerPage />} />
                <Route path="/challenges/:challengeId" element={<ChallengeDetailPage />} />
                <Route path="/glitch-lab" element={<GlitchLabPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />

                {/* Participant Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/submit-report"
                  element={
                    <ProtectedRoute>
                      <SubmitReportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-reports"
                  element={
                    <ProtectedRoute>
                      <MyReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Catch All */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
