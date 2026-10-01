import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function Settings() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header title="Global Settings" subtitle="Configure Judge0 endpoint, default timers, and event policies." />
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">System settings form.</p>
        </div>
      </main>
    </div>
  );
}
