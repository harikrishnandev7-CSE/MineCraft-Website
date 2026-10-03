import React from 'react';

export default function EditorStatus({ lineCount = 0, charCount = 0, isSaved = true }) {
  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-white/60 border border-slate-200 text-[11px] font-mono text-slate-600 rounded-b-xl">
      <div className="flex items-center gap-3">
        <span>Lines: {lineCount}</span>
        <span>Chars: {charCount}</span>
      </div>
      <div>
        <span className={`w-2 h-2 rounded-full inline-block mr-1.5 ${isSaved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
        {isSaved ? 'Saved' : 'Modified'}
      </div>
    </div>
  );
}
