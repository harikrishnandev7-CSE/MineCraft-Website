import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  Clock,
  Code2,
  PlusCircle,
  Users,
  Send,
  Trophy,
  FileSpreadsheet,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

export default function Sidebar() {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const { logout, user } = useAuthContext() || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  const navSections = [
    {
      title: 'CORE',
      items: [
        { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
      ],
    },
    {
      title: 'COMPETITION',
      items: [
        { label: 'Live Monitor', to: '/admin/live', icon: Radio },
        { label: 'Active Sessions', to: '/admin/sessions', icon: Clock },
      ],
    },
    {
      title: 'CHALLENGES',
      items: [
        { label: 'All Challenges', to: '/admin/challenges', icon: Code2, end: true },
        { label: 'Create Challenge', to: '/admin/challenges/create', icon: PlusCircle },
      ],
    },
    {
      title: 'PARTICIPANTS & AUDIT',
      items: [
        { label: 'Participants', to: '/admin/participants', icon: Users },
        { label: 'Submissions', to: '/admin/submissions', icon: Send },
        { label: 'Leaderboard', to: '/admin/leaderboard', icon: Trophy },
      ],
    },
    {
      title: 'REPORTS & CONFIG',
      items: [
        { label: 'Results & Export', to: '/admin/results', icon: FileSpreadsheet },
        { label: 'Settings', to: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const content = (
    <div className="flex flex-col h-full justify-between font-mono text-xs">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="px-3 pt-2">
          <div className="flex items-center gap-2 text-orange-400 font-black tracking-wider text-sm">
            <Shield className="w-5 h-5 text-orange-400" />
            <span>MINDCRAFT ADMIN</span>
          </div>
          <p className="text-[10px] text-slate-500 tracking-wider mt-1 uppercase font-semibold">
            Blind Coding Command Center
          </p>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsOpenMobile(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                        isActive
                          ? 'bg-orange-500/15 text-cyan-300 font-bold border border-orange-500/30 shadow-sm shadow-cyan-950'
                          : 'text-slate-600 hover:bg-white hover:text-slate-800'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="pt-4 border-t border-slate-900 space-y-2">
        <NavLink
          to="/challenge"
          className="flex items-center gap-2 text-slate-600 hover:text-orange-400 transition px-3 py-2 rounded-lg hover:bg-white/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Participant Arena</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition px-3 py-2 rounded-lg text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Session</span>
        </button>

        {user && (
          <div className="px-3 py-2 bg-black/50 rounded-lg border border-slate-200/60 text-[10px] text-slate-600 truncate">
            Admin: <strong className="text-slate-800">{user.name || user.email}</strong>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Toggle */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-orange-400 shadow-xl"
          aria-label="Toggle Navigation"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-slate-50 border-r border-slate-200 p-4 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 min-h-[calc(100vh-60px)] bg-slate-50 border-r border-slate-200/80 p-4 shrink-0">
        {content}
      </aside>
    </>
  );
}
