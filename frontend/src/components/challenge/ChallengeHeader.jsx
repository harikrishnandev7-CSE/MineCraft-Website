import React from 'react';

export default function ChallengeHeader({ title, difficulty, points, category }) {
  const difficultyColors = {
    Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white/60 border border-slate-200 rounded-xl">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">{title || 'Active Challenge'}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${difficultyColors[difficulty] || difficultyColors.Medium}`}>
            {difficulty || 'Medium'}
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1">Category: <span className="text-orange-400">{category || 'Algorithms'}</span></p>
      </div>
      <div className="text-right">
        <span className="text-xs text-slate-600 uppercase font-semibold">Reward</span>
        <div className="text-2xl font-black text-orange-400">{points || 100} <span className="text-xs font-normal text-slate-600">PTS</span></div>
      </div>
    </div>
  );
}
