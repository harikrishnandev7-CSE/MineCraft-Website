import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public & Participant Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Rules from '../pages/Rules';
import Challenge from '../pages/Challenge';
import Result from '../pages/Result';
import Leaderboard from '../pages/Leaderboard';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import Participants from '../pages/admin/Participants';
import Challenges from '../pages/admin/Challenges';
import ChallengeCreate from '../pages/admin/ChallengeCreate';
import ChallengeEdit from '../pages/admin/ChallengeEdit';
import QRManager from '../pages/admin/QRManager';
import Sessions from '../pages/admin/Sessions';
import Submissions from '../pages/admin/Submissions';
import AdminLeaderboard from '../pages/admin/Leaderboard';
import AdminResults from '../pages/admin/Results';
import Settings from '../pages/admin/Settings';

import ProtectedRoute from '../components/auth/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / Participant Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/challenge" element={<Challenge />} />
      <Route path="/result" element={<Result />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/participants"
        element={
          <ProtectedRoute requiredRole="admin">
            <Participants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges"
        element={
          <ProtectedRoute requiredRole="admin">
            <Challenges />
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
        path="/admin/qr"
        element={
          <ProtectedRoute requiredRole="admin">
            <QRManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sessions"
        element={
          <ProtectedRoute requiredRole="admin">
            <Sessions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/submissions"
        element={
          <ProtectedRoute requiredRole="admin">
            <Submissions />
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
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
