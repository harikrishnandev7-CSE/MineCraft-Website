import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useParticipant } from '../../context/ParticipantContext';
import { Cpu, Trophy, BookOpen, User, Shield } from 'lucide-react';

export default function Navbar() {
  const { participant } = useParticipant();
  const location = useLocation();

  const navLinks = [
    { label: 'Arena', to: '/challenge', icon: Cpu },
    { label: 'Rules', to: '/rules', icon: BookOpen },
    { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
    { label: 'Admin', to: '/admin', icon: Shield },
  ];

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-cyan-400 to-teal-400 p-0.5 shadow-md shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="font-mono font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-200">
              MIND CRAFT
            </span>
            <span className="hidden sm:inline text-[10px] font-mono text-slate-500 block -mt-1">
              QR Hunt & Code Assembly
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-1 font-mono text-xs">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {participant ? (
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold">
                {participant.name?.charAt(0) || 'P'}
              </div>
              <div className="hidden sm:block text-left font-mono">
                <span className="text-xs font-bold text-slate-200 block truncate max-w-[120px]">
                  {participant.name}
                </span>
                <span className="text-[10px] text-cyan-400 block -mt-0.5">
                  {participant.participantId}
                </span>
              </div>
            </div>
          ) : (
            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
