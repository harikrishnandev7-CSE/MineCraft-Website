import React from 'react';
import { Check, Lock, Search } from 'lucide-react';

const STEPS = [
  { key: 'HUNT',    label: '1  Hunt',     icon: Search },
  { key: 'ASSEMBLE',label: '2  Assemble', icon: Check },
  { key: 'DONE',    label: '3  Run',      icon: Check },
];

/**
 * PhaseStepper — shows current gameplay phase.
 * @param {'SETUP'|'HUNT'|'ASSEMBLE'|'DONE'} phase
 * @param {number} collectedCount
 * @param {number} totalCount
 */
export default function PhaseStepper({ phase, collectedCount = 0, totalCount = 0 }) {
  const activeIdx = STEPS.findIndex((s) => s.key === phase);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-white/80 border border-slate-200 rounded-2xl text-xs font-mono">
      {STEPS.map((step, idx) => {
        const isActive  = step.key === phase;
        const isDone    = activeIdx > idx;
        const Icon      = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                isActive
                  ? 'bg-orange-500/20 text-cyan-300 border border-orange-500/40 font-bold'
                  : isDone
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-50 text-slate-500 border border-slate-200'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {isDone ? (
                <Check className="w-3 h-3" />
              ) : isActive ? (
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              <span>{step.label}</span>
            </div>

            {idx < STEPS.length - 1 && (
              <span className={`text-slate-600 ${isDone ? 'text-emerald-600' : ''}`}>→</span>
            )}
          </React.Fragment>
        );
      })}

      {/* Fragment progress */}
      {totalCount > 0 && (
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-600 pl-2 border-l border-slate-200">
          <span>Fragments:</span>
          <span className={`font-bold ${collectedCount === totalCount ? 'text-emerald-400' : 'text-orange-400'}`}>
            {collectedCount}/{totalCount}
          </span>
        </div>
      )}
    </div>
  );
}
