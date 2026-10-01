import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { Users, Code, Send, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const cards = [
    { title: "Total Participants", count: 60, icon: Users, color: "text-blue-400" },
    { title: "Active Arena", count: 42, icon: Code, color: "text-cyan-400" },
    { title: "Completed", count: 18, icon: Send, color: "text-purple-400" },
    { title: "Accepted", count: 15, icon: CheckCircle2, color: "text-emerald-400" },
    { title: "Wrong Answer", count: 3, icon: XCircle, color: "text-rose-400" },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 font-mono">
        <div>
          <h2 className="text-2xl font-black text-white">Admin Control Gateway</h2>
          <p className="text-xs text-slate-400 mt-1">Live metrics and session surveillance</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">{c.title}</span>
                  <Icon className={`w-4 h-4 ${c.color}`} />
                </div>
                <div className="text-2xl font-black text-white">{c.count}</div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase">Live Session Status</h3>
          <p className="text-xs text-slate-400">
            Frontend demonstration mode: All mock data updates in browser state without backend servers.
          </p>
        </div>
      </main>
    </div>
  );
}
