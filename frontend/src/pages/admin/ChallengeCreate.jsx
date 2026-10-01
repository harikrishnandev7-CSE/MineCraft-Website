import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import Button from '../../components/common/Button';

export default function ChallengeCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <Header title="Create New Challenge" subtitle="Define problem statement, test cases, and code fragment blocks." />
        <form className="max-w-2xl space-y-4 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Challenge Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
              placeholder="e.g. Reverse Bit Stream"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm"
              placeholder="Problem statement..."
            />
          </div>
          <Button type="submit" variant="primary">Create Challenge</Button>
        </form>
      </main>
    </div>
  );
}
