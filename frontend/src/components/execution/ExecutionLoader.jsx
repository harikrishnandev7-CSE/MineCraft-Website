import React from 'react';

export default function ExecutionLoader({ statusText = 'Compiling...' }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300">
      <div className="animate-spin h-4 w-4 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full flex-shrink-0" />
      <span className="animate-pulse">{statusText}</span>
    </div>
  );
}
