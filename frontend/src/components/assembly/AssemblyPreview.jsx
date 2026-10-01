import React from 'react';
import { Code2 } from 'lucide-react';

export default function AssemblyPreview({ combinedCode }) {
  return (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
        <span className="font-semibold flex items-center gap-1.5 text-cyan-300">
          <Code2 className="w-3.5 h-3.5" /> Assembled Source Preview
        </span>
        <span className="text-[10px] text-slate-500">Live Synthesis</span>
      </div>
      <pre className="text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/60">
        {combinedCode || '// No code assembled yet. Arrange blocks on the board.'}
      </pre>
    </div>
  );
}
