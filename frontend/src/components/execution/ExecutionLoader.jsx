import React from 'react';

export default function ExecutionLoader({ status = 'Compiling and Running...' }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="animate-spin h-5 w-5 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full" />
      <span className="text-xs font-mono text-cyan-300">{status}</span>
    </div>
  );
}
