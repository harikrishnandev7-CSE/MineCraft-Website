import React from 'react';

export default function ExecutionLoader({ statusText = 'Compiling...' }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/90 border border-slate-200 rounded-xl font-mono text-xs text-cyan-300">
      <div className="animate-spin h-4 w-4 border-2 border-orange-500/20 border-t-orange-400 rounded-full flex-shrink-0" />
      <span className="animate-pulse">{statusText}</span>
    </div>
  );
}
