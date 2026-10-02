import React from 'react';
import TreasureChest from './TreasureChest';

/**
 * ChestGrid — renders all chests for the current language.
 * Wraps on small screens.
 */
export default function ChestGrid({
  chests = [],
  chestStates = {},
  fragmentMap = {},
  revealOrder = [],
  activeChestId,
  onChestClick,
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
        Treasure Chests — {chests.length} fragment{chests.length !== 1 ? 's' : ''}
      </div>
      <div className="flex flex-wrap gap-3">
        {chests.map((chest, idx) => {
          const fragmentId = revealOrder[idx];
          const fragment   = fragmentMap[fragmentId];
          const snippet    = fragment
            ? fragment.code.split('\n')[0].slice(0, 28) + (fragment.code.includes('\n') ? '…' : '')
            : undefined;

          return (
            <TreasureChest
              key={chest.id}
              chest={chest}
              chestState={chestStates[chest.id]}
              fragmentSnippet={snippet}
              isActive={chest.id === activeChestId}
              index={idx}
              onClick={() => onChestClick(chest.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
