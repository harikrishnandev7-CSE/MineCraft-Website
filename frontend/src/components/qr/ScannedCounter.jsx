import React from 'react';
import { QrCode } from 'lucide-react';

export default function ScannedCounter({ current = 0, total = 8 }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between px-3.5 py-2 bg-white/80 border border-slate-200 rounded-xl text-xs font-mono">
      <div className="flex items-center gap-2">
        <QrCode className="w-4 h-4 text-orange-400" />
        <span className="text-slate-700">
          Scanned: <strong className="text-orange-400 font-bold">{current}</strong> / {total}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-400 h-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-600 font-bold">{percent}%</span>
      </div>
    </div>
  );
}
