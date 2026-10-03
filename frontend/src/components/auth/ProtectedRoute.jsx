import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-orange-400 font-mono text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    const loginTarget = requiredRole === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
