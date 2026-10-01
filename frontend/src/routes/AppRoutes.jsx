import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public & Participant Pages
import Home from '../pages/Home';
import Register from '../pages/Register';
import Rules from '../pages/Rules';
import Challenge from '../pages/Challenge';
import Result from '../pages/Result';
import Leaderboard from '../pages/Leaderboard';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminParticipants from '../pages/admin/Participants';
import AdminChallenges from '../pages/admin/Challenges';
import AdminSubmissions from '../pages/admin/Submissions';
import AdminResults from '../pages/admin/Results';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/challenge" element={<Challenge />} />
      <Route path="/result" element={<Result />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/participants" element={<AdminParticipants />} />
      <Route path="/admin/challenges" element={<AdminChallenges />} />
      <Route path="/admin/submissions" element={<AdminSubmissions />} />
      <Route path="/admin/results" element={<AdminResults />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
