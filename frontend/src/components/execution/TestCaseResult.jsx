import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function TestCaseResult({ testCase, index }) {
  const isPassed = testCase.status === 'PASSED';

  return (
    <div
      className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
        isPassed
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
          : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
      }`}
    >
      <div className="flex items-center gap-2">
        {isPassed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
        )}
        <span className="font-semibold">Hidden Test Case #{index}</span>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
        isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
      }`}>
        {isPassed ? '✓ Passed' : '✗ Failed'}
      </span>
    </div>
  );
}
