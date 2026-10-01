import React from 'react';
import { useTimer } from '../../hooks/useTimer';
import { formatTime } from '../../utils/timer';

export default function Countdown({ durationInSeconds, onExpire }) {
  const { seconds } = useTimer(durationInSeconds, onExpire);

  return (
    <div className="text-center font-mono">
      <span className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
        {formatTime(seconds)}
      </span>
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Time Remaining</p>
    </div>
  );
}
