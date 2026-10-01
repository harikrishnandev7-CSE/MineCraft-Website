import React from 'react';
import { formatTime } from '../../utils/timer';

export default function Timer({ secondsRemaining = 0, isWarning = false }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm ${
      isWarning
        ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
        : 'bg-slate-900 border-slate-700 text-cyan-300'
    }`}>
      <span>⏱</span>
      <span>{formatTime(secondsRemaining)}</span>
    </div>
  );
}
