import React from 'react';

export default function QRCard({ block, isScanned, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isScanned
          ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400'
          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-cyan-400 font-semibold">#{block?.orderHint || '?'}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
          isScanned ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
        }`}>
          {isScanned ? 'Decoded' : 'Locked'}
        </span>
      </div>
      <p className="text-xs text-slate-300 line-clamp-2 font-mono">
        {isScanned ? block?.codePreview || block?.code : 'Scan physical QR code to reveal snippet.'}
      </p>
    </div>
  );
}
