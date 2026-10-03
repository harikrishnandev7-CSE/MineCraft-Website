import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import ParticipantForm from '../components/auth/ParticipantForm';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [tab, setTab] = useState('participant'); // 'participant' | 'admin'
  const { login, adminLogin, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleParticipantJoin = async (credentials) => {
    try {
      await login(credentials);
      navigate('/challenge');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdminSignIn = async (credentials) => {
    try {
      await adminLogin(credentials);
      navigate('/admin');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/90 border border-slate-200 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Mind Craft Portal</h2>
          <p className="text-xs text-slate-600">Enter arena credentials or admin authorization</p>
        </div>

        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTab('participant')}
            className={`flex-1 pb-3 text-center border-b-2 transition ${
              tab === 'participant' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Participant Entry
          </button>
          <button
            onClick={() => setTab('admin')}
            className={`flex-1 pb-3 text-center border-b-2 transition ${
              tab === 'admin' ? 'border-orange-400 text-orange-400' : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            Admin Sign In
          </button>
        </div>

        {tab === 'participant' ? (
          <ParticipantForm onJoin={handleParticipantJoin} isLoading={loading} error={error} />
        ) : (
          <LoginForm onSubmit={handleAdminSignIn} isLoading={loading} error={error} />
        )}
      </div>
    </div>
  );
}
