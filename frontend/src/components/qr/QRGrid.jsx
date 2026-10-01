import React from 'react';
import QRCard from './QRCard';

export default function QRGrid({ blocks = [], scannedBlockIds = [], onSelectBlock }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {blocks.map((block) => (
        <QRCard
          key={block.id || block._id}
          block={block}
          isScanned={scannedBlockIds.includes(block.id || block._id)}
          onClick={() => onSelectBlock && onSelectBlock(block)}
        />
      ))}
    </div>
  );
}
