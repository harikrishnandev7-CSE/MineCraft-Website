import React from 'react';

export default function CodeEditor({ value, onChange, language = 'python', readOnly = false }) {
  return (
    <div className="editor-container relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck="false"
        className="w-full h-80 p-4 bg-slate-950 text-slate-200 font-mono text-sm leading-relaxed outline-none resize-y selection:bg-cyan-500/30"
        placeholder="// Code assembled from QR blocks will appear here. Edit or refine before running..."
      />
    </div>
  );
}
