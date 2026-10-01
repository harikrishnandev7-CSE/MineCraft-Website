import React from 'react';

export default function SortableCodeBlock({ block, index, total, onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-start justify-between gap-3 group hover:border-cyan-500/30 transition">
      <div className="flex items-start gap-3 flex-1 overflow-hidden">
        <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-1 bg-cyan-950/50 rounded">
          {index + 1}
        </span>
        <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap flex-1">
          {block.code}
        </pre>
      </div>

      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition">
        <button
          disabled={index === 0}
          onClick={onMoveUp}
          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 text-xs"
          title="Move Up"
        >
          ▲
        </button>
        <button
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 text-xs"
          title="Move Down"
        >
          ▼
        </button>
        <button
          onClick={onRemove}
          className="p-1 text-rose-400 hover:text-rose-300 text-xs"
          title="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
