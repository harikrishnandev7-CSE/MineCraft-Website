import React from 'react';
import SortableCodeBlock from './SortableCodeBlock';

export default function AssemblyBoard({ blocks = [], onMoveBlock, onRemoveBlock }) {
  return (
    <div className="assembly-dropzone rounded-xl p-4 bg-slate-950/60 border border-dashed border-slate-800 min-h-[300px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Assembly Canvas</h3>
        <span className="text-xs text-slate-400 font-mono">{blocks.length} Blocks Placed</span>
      </div>

      {blocks.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">
          Arrange fragments here in correct execution order
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <SortableCodeBlock
              key={block.id || index}
              block={block}
              index={index}
              total={blocks.length}
              onMoveUp={() => onMoveBlock(index, index - 1)}
              onMoveDown={() => onMoveBlock(index, index + 1)}
              onRemove={() => onRemoveBlock(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
