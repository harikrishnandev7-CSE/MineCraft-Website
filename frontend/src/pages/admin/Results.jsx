import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { INITIAL_LEADERBOARD } from '../../data/leaderboard';
import Button from '../../components/common/Button';
import { Download } from 'lucide-react';

export default function AdminResults() {
  const handleExportCSV = () => {
    const rows = ['Rank,Name,Participant ID,College,Challenge,Status,Time'];
    INITIAL_LEADERBOARD.forEach((r) => {
      rows.push(`${r.rank},${r.name},${r.participantId},${r.college},${r.challengeTitle},${r.status},${r.timeFormatted}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindcraft_final_results.csv';
    a.click();
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 font-mono">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Event Results & Exports</h2>
            <p className="text-xs text-slate-400 mt-1">Export official scorecards and certificates</p>
          </div>
          <Button variant="emerald" size="sm" icon={Download} onClick={handleExportCSV}>
            Export Results CSV
          </Button>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Challenge</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {INITIAL_LEADERBOARD.map((r) => (
                <tr key={r.rank} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold text-cyan-400">#{r.rank}</td>
                  <td className="px-4 py-3 text-white font-semibold">{r.name}</td>
                  <td className="px-4 py-3">{r.college}</td>
                  <td className="px-4 py-3 text-slate-400">{r.challengeTitle}</td>
                  <td className="px-4 py-3 text-emerald-400 font-bold">{r.timeFormatted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
