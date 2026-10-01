import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🧠</span>
          <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            MIND CRAFT
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/challenge" className="text-slate-300 hover:text-cyan-400 transition">
            Arena
          </Link>
          <Link to="/leaderboard" className="text-slate-300 hover:text-cyan-400 transition">
            Leaderboard
          </Link>
          <Link to="/rules" className="text-slate-300 hover:text-cyan-400 transition">
            Rules
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">{user?.name || user?.teamName}</span>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition shadow-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
