import React from 'react';
import CodeBlock from './CodeBlock';
import { Layers } from 'lucide-react';

export default function CollectedBlocks({ blocks = [], placedBlockIds = [], onAddToBoard }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> COLLECTED CODE BLOCKS ({blocks.length})
        </h4>
      </div>

      {blocks.length === 0 ? (
        <div className="p-6 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl text-center">
          <p className="text-xs text-slate-500 font-mono">
            No fragments unlocked yet. Click digital QR cards in the hunt panel to scan and unlock code.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {blocks.map((block) => (
            <CodeBlock
              key={block.blockId}
              block={block}
              isAdded={placedBlockIds.includes(block.blockId)}
              onAdd={onAddToBoard}
            />
          ))}
        </div>
      )}
    </div>
  );
}
