import React from 'react';
import { Plus, Check } from 'lucide-react';

export default function CodeBlock({ block, onAdd, isAdded }) {
  return (
    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition flex items-center justify-between gap-3 group">
      <div className="overflow-hidden flex-1">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1">
          <span className="font-bold text-cyan-400">#{block.blockId}</span>
          <span className="uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {block.type || 'BLOCK'}
          </span>
        </div>
        <pre className="text-xs font-mono text-slate-200 truncate whitespace-pre">
          {block.code.split('\n')[0]}
        </pre>
      </div>

      <button
        onClick={() => onAdd(block)}
        disabled={isAdded}
        className={`p-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
          isAdded
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 border border-cyan-500/40'
        }`}
        title={isAdded ? 'Already in assembly' : 'Add to assembly board'}
      >
        {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
