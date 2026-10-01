import React from 'react';

export default function RuntimeError({ error }) {
  return (
    <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg">
      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
        Runtime Error
      </span>
      <pre className="text-xs font-mono text-amber-200 whitespace-pre-wrap">{error}</pre>
    </div>
  );
}
