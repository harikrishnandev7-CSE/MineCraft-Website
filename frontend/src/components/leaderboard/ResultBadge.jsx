import React from 'react';

export default function ResultBadge({ count = 0 }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 font-mono">
      {count} Solved
    </span>
  );
}
