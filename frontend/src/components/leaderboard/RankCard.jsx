import React from 'react';

export default function RankCard({ rank, teamName, score, pointsBehind }) {
  return (
    <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 rounded-xl shadow-lg flex items-center justify-between">
      <div>
        <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">Your Standings</span>
        <h3 className="text-2xl font-black text-white mt-1">{teamName || 'Your Team'}</h3>
        {pointsBehind > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">{pointsBehind} pts behind 1st place</p>
        )}
      </div>
      <div className="text-right">
        <span className="text-3xl font-black text-cyan-400">#{rank || '-'}</span>
        <div className="text-xs font-mono text-emerald-400 mt-1">{score || 0} PTS</div>
      </div>
    </div>
  );
}
