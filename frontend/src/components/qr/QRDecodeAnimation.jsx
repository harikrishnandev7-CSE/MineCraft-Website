import React from 'react';

export default function QRDecodeAnimation({ active }) {
  if (!active) return null;

  return (
    <div className="relative w-full h-32 bg-slate-950 rounded-lg overflow-hidden border border-cyan-500/50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 animate-pulse" />
      <span className="font-mono text-cyan-400 text-xs tracking-widest animate-bounce">
        DECRYPTING QR MATRIX...
      </span>
    </div>
  );
}
