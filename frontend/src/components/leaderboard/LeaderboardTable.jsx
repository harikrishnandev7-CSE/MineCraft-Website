import React from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';

export default function LeaderboardTable({ rankings = [], currentParticipantId = null }) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white/80 shadow-xl">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-slate-50/90 text-slate-600 uppercase tracking-wider border-b border-slate-200 text-[11px]">
          <tr>
            <th className="px-5 py-3.5">Rank</th>
            <th className="px-5 py-3.5">Participant</th>
            <th className="px-5 py-3.5">Challenge</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5 text-right">Completion Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {rankings.map((r) => {
            const isMe = currentParticipantId && (r.participantId === currentParticipantId || r.id === currentParticipantId);
            return (
              <tr
                key={r.id || r.rank}
                className={`transition-colors ${
                  isMe
                    ? 'bg-cyan-950/40 border-l-4 border-l-orange-400 text-slate-900 font-bold'
                    : 'hover:bg-slate-850/50 text-slate-700'
                }`}
              >
                <td className="px-5 py-3.5 font-bold flex items-center gap-2">
                  {r.rank === 1 ? (
                    <Trophy className="w-4 h-4 text-amber-400 inline" />
                  ) : (
                    <span>#{r.rank}</span>
                  )}
                  {isMe && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500 text-slate-950 uppercase font-black">
                      YOU
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-slate-900">{r.name}</div>
                  <div className="text-[10px] text-slate-500">{r.college || r.participantId}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-600">{r.challengeTitle}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> {r.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-cyan-300">
                  {r.timeFormatted}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
