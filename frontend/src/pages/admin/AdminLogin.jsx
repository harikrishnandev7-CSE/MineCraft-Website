import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const { adminLogin, loading, error, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleAdminSignIn = async (credentials) => {
    try {
      await adminLogin(credentials);
      navigate('/admin', { replace: true });
    } catch {
      // Error message is stored in AuthContext and shown in LoginForm
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-mono">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-wider">ADMIN CONTROL GATEWAY</h2>
          <p className="text-xs text-slate-400">MindCraft Blind Coding Platform Administrator</p>
        </div>
        <LoginForm onSubmit={handleAdminSignIn} isLoading={loading} error={error} />
        <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-500">
          Default Admin: <span className="text-cyan-400 font-semibold">admin@mindcraft.io</span>
        </div>
      </div>
    </div>
  );
}
