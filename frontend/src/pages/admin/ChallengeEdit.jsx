import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function ChallengeEdit() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header title="Edit Challenge" subtitle="Modify blocks, test cases, and parameters." />
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">Editor form loaded dynamically.</p>
        </div>
      </main>
    </div>
  );
}
