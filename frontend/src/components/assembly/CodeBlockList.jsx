import React from 'react';
import CodeBlock from './CodeBlock';

export default function CodeBlockList({ blocks = [] }) {
  return (
    <div className="space-y-2">
      {blocks.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-4">No blocks collected yet.</p>
      ) : (
        blocks.map((block, idx) => <CodeBlock key={block.id || idx} block={block} index={idx} />)
      )}
    </div>
  );
}
