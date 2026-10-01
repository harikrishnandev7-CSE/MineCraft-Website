import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header title="Control Dashboard" subtitle="Overview of arena activity, sessions, and Judge0 throughput." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-mono">Active Teams</span>
            <p className="text-3xl font-black text-cyan-400 mt-2">24</p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-mono">Challenges Active</span>
            <p className="text-3xl font-black text-emerald-400 mt-2">6</p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-mono">QR Blocks Discovered</span>
            <p className="text-3xl font-black text-purple-400 mt-2">142</p>
          </div>
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 uppercase font-mono">Submissions Tested</span>
            <p className="text-3xl font-black text-amber-400 mt-2">89</p>
          </div>
        </div>
      </main>
    </div>
  );
}
