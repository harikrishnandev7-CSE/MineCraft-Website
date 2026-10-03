import React from 'react';

export default function ChallengeInstructions({ description, inputFormat, outputFormat, constraints, samples }) {
  return (
    <div className="space-y-6 text-sm text-slate-700">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Description</h4>
        <p className="leading-relaxed whitespace-pre-line text-slate-800">{description}</p>
      </div>

      {inputFormat && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Input Format</h4>
          <p className="leading-relaxed bg-white/80 p-3 rounded border border-slate-200 font-mono text-xs">{inputFormat}</p>
        </div>
      )}

      {outputFormat && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Output Format</h4>
          <p className="leading-relaxed bg-white/80 p-3 rounded border border-slate-200 font-mono text-xs">{outputFormat}</p>
        </div>
      )}

      {constraints && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Constraints</h4>
          <div className="bg-white/80 p-3 rounded border border-slate-200 font-mono text-xs space-y-1">
            {constraints.split('\n').map((c, i) => (
              <div key={i}>• {c}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
