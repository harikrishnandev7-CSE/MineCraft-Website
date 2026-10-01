import React from 'react';

export default function CollectedBlocks({ blocks = [], onAddToBoard }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Collected Fragments</h3>
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between gap-3 hover:border-cyan-500/40 transition"
          >
            <div className="overflow-hidden">
              <span className="text-[10px] text-cyan-400 font-mono">#{block.orderHint}</span>
              <p className="text-xs font-mono text-slate-300 truncate">{block.code.split('\n')[0]}</p>
            </div>
            {onAddToBoard && (
              <button
                onClick={() => onAddToBoard(block)}
                className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition whitespace-nowrap"
              >
                + Add
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
