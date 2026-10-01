import React from 'react';

export default function TestCaseResult({ testCase, index }) {
  const isPassed = testCase.passed || testCase.status === 'ACCEPTED';

  return (
    <div className={`p-2.5 rounded border text-xs flex items-center justify-between font-mono ${
      isPassed ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
        <span>Test Case #{index}</span>
      </div>
      <span className="font-bold">{isPassed ? 'PASSED' : 'FAILED'}</span>
    </div>
  );
}
