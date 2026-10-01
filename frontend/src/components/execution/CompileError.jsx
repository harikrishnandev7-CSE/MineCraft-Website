import React from 'react';

export default function CompileError({ error }) {
  return (
    <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg">
      <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
        Compilation Error
      </span>
      <pre className="text-xs font-mono text-rose-200 whitespace-pre-wrap">{error}</pre>
    </div>
  );
}
