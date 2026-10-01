import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

export default function Challenges() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header
          title="Challenge Library"
          subtitle="Create, configure, and inspect challenges."
          actions={
            <Link to="/admin/challenges/create" className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-sm">
              + New Challenge
            </Link>
          }
        />
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <p className="text-sm text-slate-400">List of active and draft challenges.</p>
        </div>
      </main>
    </div>
  );
}
