import React from 'react';
import { Key, AlertTriangle, Clock } from 'lucide-react';

/**
 * ProgressCard — left-column progress summary replacing the QR scanner button.
 */
export default function ProgressCard({
  earnedKeys = 0,
  collectedCount = 0,
  totalCount = 0,
  penaltySeconds = 0,
  quizAttempts = 0,
  phase = 'HUNT',
}) {
  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
        Progress
      </h4>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="flex flex-col gap-0.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Fragments</span>
          <span className={`text-base font-black ${collectedCount === totalCount ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {collectedCount}<span className="text-slate-600 font-normal">/{totalCount}</span>
          </span>
        </div>

        <div className="flex flex-col gap-0.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Phase</span>
          <span className={`text-sm font-black ${
            phase === 'ASSEMBLE' ? 'text-emerald-400' : phase === 'HUNT' ? 'text-cyan-400' : 'text-slate-300'
          }`}>
            {phase}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Penalty
          </span>
          <span className={`text-sm font-black ${penaltySeconds > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
            +{penaltySeconds}s
          </span>
        </div>

        <div className="flex flex-col gap-0.5 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase">Quiz Tries</span>
          <span className="text-sm font-black text-slate-300">{quizAttempts}</span>
        </div>
      </div>

      {penaltySeconds > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400/80">
          <AlertTriangle className="w-3 h-3" />
          <span>Penalty time adds to your ranking time.</span>
        </div>
      )}
    </div>
  );
}
