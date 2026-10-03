import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public & Participant Pages
import Home from '../pages/Home';
import Register from '../pages/Register';
import Rules from '../pages/Rules';
import Challenges from '../pages/Challenges';
import Challenge from '../pages/Challenge';
import Result from '../pages/Result';
import Leaderboard from '../pages/Leaderboard';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminParticipants from '../pages/admin/Participants';
import AdminChallenges from '../pages/admin/Challenges';
import ChallengeCreate from '../pages/admin/ChallengeCreate';
import ChallengeEdit from '../pages/admin/ChallengeEdit';
import AdminSubmissions from '../pages/admin/Submissions';
import AdminResults from '../pages/admin/Results';
import AdminSessions from '../pages/admin/Sessions';
import AdminLeaderboard from '../pages/admin/Leaderboard';
import AdminSettings from '../pages/admin/Settings';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public & Participant Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/challenges" element={<Challenges />} />
      <Route path="/challenge" element={<Challenge />} />
      <Route path="/result" element={<Result />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Admin Authentication */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin Management Routes - Protected with Admin Role */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminChallenges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges/create"
        element={
          <ProtectedRoute requiredRole="admin">
            <ChallengeCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges/:id/edit"
        element={
          <ProtectedRoute requiredRole="admin">
            <ChallengeEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/participants"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminParticipants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/live"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSessions isLiveMonitor={true} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/submissions"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSubmissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leaderboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLeaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/results"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
