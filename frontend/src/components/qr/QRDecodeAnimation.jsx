import React from 'react';
import { Scan, Radio } from 'lucide-react';

export default function QRDecodeAnimation({ active = true }) {
  if (!active) return null;

  return (
    <div className="relative w-full h-36 bg-slate-50 rounded-xl border border-orange-500/40 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

      {/* Laser line animation */}
      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-laser" />

      {/* Scanning HUD */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-orange-400/50 flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/20">
          <Scan className="w-6 h-6 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-300 tracking-widest uppercase">
          <Radio className="w-3 h-3 text-orange-400 animate-ping" />
          <span>DECRYPTING MATRIX</span>
        </div>
      </div>
    </div>
  );
}
