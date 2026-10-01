import React from 'react';
import TestCaseResult from './TestCaseResult';
import { Terminal, CheckCircle2, AlertOctagon, Clock, Cpu } from 'lucide-react';

export default function OutputPanel({ compileOutput, submissionResult, sampleInput, sampleOutput }) {
  return (
    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-mono">
          <Terminal className="w-4 h-4 text-cyan-400" /> EXECUTION RESULT
        </h4>
      </div>

      {/* SAMPLE TEST CASE REFERENCE */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SAMPLE TEST</span>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <span className="text-slate-500 block text-[10px]">Input:</span>
            <code className="text-cyan-300 text-xs">{sampleInput || '5'}</code>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Expected Output:</span>
            <code className="text-emerald-300 text-xs">{sampleOutput || '15'}</code>
          </div>
        </div>
      </div>

      {/* SUBMISSION TEST RESULTS */}
      {submissionResult && (
        <div className="space-y-3">
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 ${
              submissionResult.status === 'ACCEPTED'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            {submissionResult.status === 'ACCEPTED' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertOctagon className="w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <h5 className="font-mono font-bold text-sm">{submissionResult.title}</h5>
              <p className="text-xs text-slate-300">{submissionResult.message}</p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold text-slate-400">Hidden Test Evaluations:</span>
            {submissionResult.testResults?.map((tr, idx) => (
              <TestCaseResult key={idx} testCase={tr} index={idx + 1} />
            ))}
          </div>
        </div>
      )}

      {/* COMPILER OUTPUT */}
      {compileOutput && (
        <div className="space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>
              Status: <strong className={compileOutput.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>{compileOutput.status.toUpperCase()}</strong>
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-cyan-400" /> {compileOutput.executionTime}</span>
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-cyan-400" /> {compileOutput.memory}</span>
            </div>
          </div>

          {compileOutput.stdout && (
            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Standard Output:</span>
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300 whitespace-pre-wrap">
                {compileOutput.stdout}
              </pre>
            </div>
          )}

          {compileOutput.stderr && (
            <div>
              <span className="text-[10px] text-rose-400 block mb-1">Standard Error:</span>
              <pre className="p-3 bg-rose-950/30 rounded-lg border border-rose-500/30 text-rose-200 whitespace-pre-wrap">
                {compileOutput.stderr}
              </pre>
            </div>
          )}

          {compileOutput.compileOutput && (
            <p className="text-[10px] text-slate-500 italic">{compileOutput.compileOutput}</p>
          )}
        </div>
      )}

      {!compileOutput && !submissionResult && (
        <p className="text-xs font-mono text-slate-500 text-center py-4">
          Click "Run Code" to compile against sample input, or "Submit Solution" for hidden test scoring.
        </p>
      )}
    </div>
  );
}
