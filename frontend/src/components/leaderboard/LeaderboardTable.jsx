import React from 'react';
import ResultBadge from './ResultBadge';

export default function LeaderboardTable({ rankings = [] }) {
  return (
    <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900/60">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950/80 text-xs uppercase font-mono text-slate-400 border-b border-slate-800">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Team / Participant</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Solved</th>
            <th className="px-4 py-3">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rankings.map((r, index) => (
            <tr key={r.id || index} className="hover:bg-slate-800/40 transition">
              <td className="px-4 py-3 font-mono font-bold text-cyan-400">#{index + 1}</td>
              <td className="px-4 py-3 font-semibold text-slate-100">{r.teamName || r.name}</td>
              <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{r.totalScore || 0}</td>
              <td className="px-4 py-3">
                <ResultBadge count={r.challengesSolved || 0} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-400 font-mono">{r.timeFormatted || '00:00'}</td>
            </tr>
          ))}
          {rankings.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-8 text-slate-500 text-xs">
                No participants ranked yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
