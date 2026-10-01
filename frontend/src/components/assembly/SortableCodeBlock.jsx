import React from 'react';
import { ArrowUp, ArrowDown, Trash2, GripVertical } from 'lucide-react';

export default function SortableCodeBlock({
  block,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between gap-3 group hover:border-cyan-500/40 hover:bg-slate-850/80 transition cursor-grab active:cursor-grabbing shadow-sm"
    >
      <div className="flex items-start gap-2.5 flex-1 overflow-hidden">
        <div className="flex items-center text-slate-500 hover:text-slate-300 pt-0.5">
          <GripVertical className="w-4 h-4" />
        </div>
        <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 bg-cyan-950/60 rounded border border-cyan-500/30">
          {index + 1}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold text-slate-400">
              Block {block.blockId}
            </span>
          </div>
          <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
            {block.code}
          </pre>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition pt-0.5">
        <button
          disabled={index === 0}
          onClick={onMoveUp}
          className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded disabled:opacity-20 disabled:hover:bg-transparent"
          title="Move Up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          disabled={index === total - 1}
          onClick={onMoveDown}
          className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded disabled:opacity-20 disabled:hover:bg-transparent"
          title="Move Down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded ml-1"
          title="Remove from board"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
