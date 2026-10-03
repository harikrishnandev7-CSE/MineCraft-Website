import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';

export default function Podium({ topThree = [] }) {
  if (topThree.length < 3) return null;

  const [first, second, third] = topThree;

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-6 items-end pt-4 pb-6">
      {/* 2nd Place */}
      <div className="bg-white/80 border border-slate-300/80 rounded-2xl p-4 text-center space-y-2 order-1 shadow-lg hover:border-slate-500 transition">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 border border-slate-400 flex items-center justify-center text-slate-700">
          <Medal className="w-5 h-5 text-slate-700" />
        </div>
        <span className="text-xs font-mono font-bold text-slate-600 uppercase tracking-widest">2nd Place</span>
        <h4 className="text-sm md:text-base font-bold text-slate-900 truncate">{second.name}</h4>
        <p className="text-[11px] text-slate-600 truncate">{second.college}</p>
        <div className="text-xs font-mono font-bold text-orange-400">{second.timeFormatted}</div>
      </div>

      {/* 1st Place */}
      <div className="bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 text-center space-y-2.5 order-2 shadow-2xl shadow-amber-500/10 -translate-y-2 hover:border-amber-400 transition">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-500/20">
          <Trophy className="w-6 h-6 text-amber-300 animate-pulse" />
        </div>
        <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest">CHAMPION</span>
        <h4 className="text-base md:text-lg font-black text-slate-900 truncate">{first.name}</h4>
        <p className="text-xs text-slate-700 truncate">{first.college}</p>
        <div className="text-sm font-mono font-black text-emerald-400">{first.timeFormatted}</div>
      </div>

      {/* 3rd Place */}
      <div className="bg-white/80 border border-amber-900/40 rounded-2xl p-4 text-center space-y-2 order-3 shadow-lg hover:border-amber-800 transition">
        <div className="w-10 h-10 mx-auto rounded-full bg-amber-950/60 border border-amber-700/60 flex items-center justify-center text-amber-600">
          <Award className="w-5 h-5 text-amber-500" />
        </div>
        <span className="text-xs font-mono font-bold text-amber-600/90 uppercase tracking-widest">3rd Place</span>
        <h4 className="text-sm md:text-base font-bold text-slate-900 truncate">{third.name}</h4>
        <p className="text-[11px] text-slate-600 truncate">{third.college}</p>
        <div className="text-xs font-mono font-bold text-orange-400">{third.timeFormatted}</div>
      </div>
    </div>
  );
}
