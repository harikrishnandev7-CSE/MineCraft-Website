import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { label: 'Overview', to: '/admin' },
    { label: 'Challenges', to: '/admin/challenges' },
    { label: 'Participants', to: '/admin/participants' },
    { label: 'QR Manager', to: '/admin/qr' },
    { label: 'Sessions', to: '/admin/sessions' },
    { label: 'Submissions', to: '/admin/submissions' },
    { label: 'Leaderboard', to: '/admin/leaderboard' },
    { label: 'Settings', to: '/admin/settings' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 p-4 space-y-4">
      <div className="px-3 py-2">
        <span className="text-xs uppercase font-mono tracking-widest text-slate-500">Admin Control</span>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
