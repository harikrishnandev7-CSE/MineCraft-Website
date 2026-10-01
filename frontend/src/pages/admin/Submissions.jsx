import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function Submissions() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header title="Submission Stream" subtitle="Live feed of compiled and evaluated student submissions." />
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">Live submission queue and logs.</p>
        </div>
      </main>
    </div>
  );
}
