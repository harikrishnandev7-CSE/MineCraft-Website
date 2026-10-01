import React from 'react';

export default function CodeBlock({ block, index }) {
  return (
    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span className="font-mono font-semibold text-cyan-400">Block #{index + 1}</span>
        <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded">{block.type || 'SNIPPET'}</span>
      </div>
      <pre className="text-xs font-mono text-slate-200 overflow-x-auto">{block.code}</pre>
    </div>
  );
}
