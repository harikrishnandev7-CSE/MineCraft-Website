import React from 'react';

export default function AssemblyPreview({ combinedCode }) {
  return (
    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Merged Assembly Preview</span>
        <span className="text-[10px] text-slate-500 font-mono">Read-Only View</span>
      </div>
      <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-200 max-h-56 overflow-y-auto whitespace-pre">
        {combinedCode || '// No blocks arranged yet.'}
      </pre>
    </div>
  );
}
