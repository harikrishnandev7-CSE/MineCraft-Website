import React from 'react';
import { formatTime } from '../../utils/timer';
import { Clock } from 'lucide-react';

export default function Timer({ secondsRemaining = 0, timerState = 'normal' }) {
  const styles = {
    normal: 'bg-white border-slate-300 text-orange-400 shadow-sm shadow-cyan-950/30',
    warning: 'bg-amber-950/60 border-amber-500 text-amber-300 animate-pulse shadow-lg shadow-amber-950/40',
    critical: 'bg-rose-950/80 border-rose-500 text-rose-300 animate-bounce shadow-xl shadow-rose-950/60',
    expired: 'bg-white border-rose-500/60 text-rose-400 opacity-80',
  };

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm transition-all ${
        styles[timerState] || styles.normal
      }`}
    >
      <Clock className="w-4 h-4 flex-shrink-0" />
      <div>
        <span className="text-[9px] uppercase tracking-widest text-slate-600 block -mb-0.5">Time Left</span>
        <span className="text-base tracking-wider">{formatTime(secondsRemaining)}</span>
      </div>
    </div>
  );
}
