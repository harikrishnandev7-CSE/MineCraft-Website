import React from 'react';

export default function ScannedCounter({ current = 0, total = 0 }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg">
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
      <span className="text-xs font-mono text-slate-300">
        Codes: <strong className="text-cyan-400">{current}</strong> / {total}
      </span>
    </div>
  );
}
