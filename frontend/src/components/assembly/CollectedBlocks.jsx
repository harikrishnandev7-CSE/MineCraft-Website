import React from 'react';
import CodeBlock from './CodeBlock';
import { Layers } from 'lucide-react';

export default function CollectedBlocks({ blocks = [], placedBlockIds = [], onAddToBoard }) {
  const uniqueBlocks = React.useMemo(() => {
    const seen = new Set();
    return blocks.filter((b) => {
      if (!b?.blockId || seen.has(b.blockId)) return false;
      seen.add(b.blockId);
      return true;
    });
  }, [blocks]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Layers className="w-3.5 h-3.5 text-orange-400" /> COLLECTED CODE BLOCKS ({uniqueBlocks.length})
        </h4>
      </div>

      {uniqueBlocks.length === 0 ? (
        <div className="p-6 bg-white/30 border border-dashed border-slate-200 rounded-xl text-center">
          <p className="text-xs text-slate-500 font-mono">
            No fragments unlocked yet. Click digital QR cards in the hunt panel to scan and unlock code.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {uniqueBlocks.map((block) => (
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
