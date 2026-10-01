import React from 'react';

export default function QRResult({ block }) {
  if (!block) return null;

  return (
    <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Block Unlocked!</span>
        <span className="text-xs font-mono text-slate-400">Order: #{block.orderHint}</span>
      </div>
      <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-emerald-200 overflow-x-auto">
        {block.code}
      </pre>
    </div>
  );
}
