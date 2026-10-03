import React from 'react';

export default function CodeEditor({ code, language = 'python', onChange, readOnly = false }) {
  const lineCount = (code || '').split('\n').length;

  return (
    <div className="relative border-x border-b border-slate-200 bg-slate-50 overflow-hidden font-mono text-xs">
      <div className="flex min-h-[300px] max-h-[420px]">
        {/* Line numbers */}
        <div className="py-4 pl-3 pr-2 text-right text-slate-600 bg-slate-50/80 border-r border-slate-900 select-none w-10 text-[11px] font-mono">
          {Array.from({ length: Math.max(12, lineCount) }).map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Viewport */}
        <div className="flex-1 relative overflow-auto p-4">
          <textarea
            value={code}
            onChange={(e) => onChange && onChange(e.target.value)}
            readOnly={readOnly}
            spellCheck="false"
            placeholder="// Assembled code from the board will compile here..."
            className="w-full h-full bg-transparent text-slate-900 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-orange-500/30 whitespace-pre"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 bg-white/60 border-t border-slate-200 text-[10px] font-mono text-slate-600">
        <span>Lines: {lineCount}</span>
        <span className="text-orange-400 uppercase">SYNTHESIZED ENVIRONMENT ({language})</span>
      </div>
    </div>
  );
}
