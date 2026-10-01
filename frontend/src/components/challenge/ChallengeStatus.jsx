import React from 'react';

export default function ChallengeStatus({ totalBlocks, scannedBlocks, isCompleted }) {
  const percent = totalBlocks > 0 ? Math.round((scannedBlocks / totalBlocks) * 100) : 0;

  return (
    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <span className="text-xs font-medium text-slate-300">
          Assembly Progress: {scannedBlocks}/{totalBlocks} Blocks Discovered
        </span>
      </div>
      <div className="text-xs font-bold text-cyan-400">{percent}%</div>
    </div>
  );
}
