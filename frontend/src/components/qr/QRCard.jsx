import React from 'react';
import { QrCode, CheckCircle, Lock } from 'lucide-react';

export default function QRCard({ qrItem, isScanned, onClick }) {
  return (
    <div
      onClick={!isScanned ? onClick : undefined}
      className={`relative p-4 rounded-xl border transition-all duration-200 select-none group ${
        isScanned
          ? 'bg-slate-900/50 border-emerald-500/30 opacity-75 cursor-default'
          : 'bg-slate-900/90 border-slate-800 hover:border-cyan-400/80 hover:bg-slate-850 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer active:scale-95'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold tracking-wider text-slate-400 group-hover:text-cyan-300 transition">
          {qrItem.qrId}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wide flex items-center gap-1 ${
            isScanned
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {isScanned ? (
            <>
              <CheckCircle className="w-3 h-3" /> SCANNED
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 text-cyan-400/70" /> LOCKED
            </>
          )}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 mb-3 group-hover:border-cyan-500/30 transition">
        {/* Synthetic QR Code matrix graphic */}
        <div className="w-16 h-16 relative flex items-center justify-center">
          <QrCode
            className={`w-14 h-14 transition-colors ${
              isScanned ? 'text-emerald-500/60' : 'text-cyan-400 group-hover:text-cyan-300'
            }`}
          />
          {!isScanned && (
            <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/10 rounded flex items-center justify-center" />
          )}
        </div>
      </div>

      <div className="text-center">
        <span className="text-[11px] font-mono text-slate-500 tracking-tight block truncate">
          {isScanned ? 'Token Verified' : qrItem.token}
        </span>
        <p className="text-[10px] font-semibold text-cyan-400/90 mt-1 uppercase tracking-wider group-hover:text-cyan-300">
          {isScanned ? '✓ Block Unlocked' : 'Solve Task to Unlock'}
        </p>
      </div>
    </div>
  );
}
