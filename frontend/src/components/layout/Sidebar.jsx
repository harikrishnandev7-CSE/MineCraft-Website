import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Code, Send, Trophy, ArrowLeft } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'Participants', to: '/admin/participants', icon: Users },
    { label: 'Challenges', to: '/admin/challenges', icon: Code },
    { label: 'Submissions', to: '/admin/submissions', icon: Send },
    { label: 'Results', to: '/admin/results', icon: Trophy },
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-60px)] bg-slate-950 border-r border-slate-800 p-4 space-y-6 font-mono">
      <div className="px-3 py-1">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
          DEMO ADMIN DASHBOARD
        </span>
      </div>

      <nav className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-slate-900">
        <NavLink
          to="/challenge"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Arena
        </NavLink>
      </div>
    </aside>
  );
}
