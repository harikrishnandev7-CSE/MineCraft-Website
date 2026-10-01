import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const { adminLogin, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleAdminSignIn = async (credentials) => {
    await adminLogin(credentials);
    navigate('/admin');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">Admin Control Gateway</h2>
          <p className="text-xs text-slate-400">Authorized personnel only</p>
        </div>
        <LoginForm onSubmit={handleAdminSignIn} isLoading={loading} error={error} />
      </div>
    </div>
  );
}
