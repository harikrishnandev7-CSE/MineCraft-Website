import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { CHALLENGES } from '../../data/challenges';
import Button from '../../components/common/Button';

export default function AdminChallenges() {
  const [challengesList, setChallengesList] = useState(CHALLENGES);
  const [form, setForm] = useState({
    title: '',
    description: '',
    language: 'python',
    duration: 20,
    blockCount: 6,
    sampleInput: '',
    sampleOutput: '',
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title) return;
    const newChal = {
      id: `ch-${Date.now()}`,
      title: form.title,
      description: form.description,
      duration: form.duration * 60,
      sampleInput: form.sampleInput,
      sampleOutput: form.sampleOutput,
      category: 'Custom Admin Challenge',
      difficulty: 'Medium',
      points: 100,
      languages: CHALLENGES[0].languages, // inherit default structure
    };
    setChallengesList([newChal, ...challengesList]);
    setForm({ title: '', description: '', language: 'python', duration: 20, blockCount: 6, sampleInput: '', sampleOutput: '' });
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8 font-mono">
        <div>
          <h2 className="text-2xl font-black text-white">Challenge Manager</h2>
          <p className="text-xs text-slate-400 mt-1">Configure competition problem statements and parameters</p>
        </div>

        <form onSubmit={handleCreate} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 max-w-2xl text-xs">
          <h3 className="text-sm font-bold text-cyan-400 uppercase">Create Mock Challenge</h3>
          <div>
            <label className="block text-slate-400 mb-1">Challenge Name</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Find GCD of Two Numbers"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Problem description..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1">Sample Input</label>
              <input
                type="text"
                value={form.sampleInput}
                onChange={(e) => setForm({ ...form, sampleInput: e.target.value })}
                placeholder="e.g. 12 18"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Sample Output</label>
              <input
                type="text"
                value={form.sampleOutput}
                onChange={(e) => setForm({ ...form, sampleOutput: e.target.value })}
                placeholder="e.g. 6"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" size="sm">
            Save Challenge
          </Button>
        </form>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase">Active Challenges ({challengesList.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challengesList.map((c) => (
              <div key={c.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <h4 className="text-sm font-bold text-white">{c.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
