import React, { useState } from 'react';
import SortableCodeBlock from './SortableCodeBlock';
import { Blocks, RotateCcw } from 'lucide-react';

/**
 * AssemblyBoard — reorder all fragments on the board.
 * In the new model all fragments are always present; no add/remove.
 */
export default function AssemblyBoard({ blocks = [], onReorder, onRemove, onClear }) {
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      onReorder(draggedIdx, targetIdx);
    }
    setDraggedIdx(null);
  };

  return (
    <div className="p-4 bg-white/60 border border-slate-200 rounded-2xl space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Blocks className="w-4 h-4 text-orange-400" /> ASSEMBLE YOUR PROGRAM
          </h4>
          <span className="text-[11px] font-mono text-orange-400 font-semibold">
            Fragments: {blocks.length} — drag or use ▲▼ to reorder
          </span>
        </div>

        {blocks.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-rose-950/30 rounded"
            title="Reset to default shuffled order"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      {blocks.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
          <p className="text-xs font-mono text-slate-600 font-semibold">Assembly board is empty.</p>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            Complete all quizzes and open all chests to populate the board.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {blocks.map((block, idx) => (
            <SortableCodeBlock
              key={block.id || block.blockId || idx}
              block={block}
              index={idx}
              total={blocks.length}
              onMoveUp={() => onReorder(idx, idx - 1)}
              onMoveDown={() => onReorder(idx, idx + 1)}
              onRemove={() => onRemove?.(idx)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
