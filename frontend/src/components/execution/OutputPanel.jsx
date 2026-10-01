import React from 'react';
import CompileError from './CompileError';
import RuntimeError from './RuntimeError';
import TestCaseResult from './TestCaseResult';

export default function OutputPanel({ output, compileError, runtimeError, testResults = [] }) {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Console & Test Output</h4>
      </div>

      {compileError && <CompileError error={compileError} />}
      {runtimeError && <RuntimeError error={runtimeError} />}

      {testResults.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400">Test Cases:</span>
          <div className="space-y-1.5">
            {testResults.map((tc, idx) => (
              <TestCaseResult key={idx} testCase={tc} index={idx + 1} />
            ))}
          </div>
        </div>
      )}

      {output && (
        <div>
          <span className="text-xs font-semibold text-slate-400">Raw Output:</span>
          <pre className="mt-1 p-3 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-48 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}

      {!compileError && !runtimeError && testResults.length === 0 && !output && (
        <p className="text-xs text-slate-500 font-mono">No execution output yet.</p>
      )}
    </div>
  );
}
