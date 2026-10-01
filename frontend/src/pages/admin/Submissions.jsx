import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

export default function AdminSubmissions() {
  const dummySubs = [
    { id: 'sub-01', participant: 'Arun Kumar', challenge: 'Find the Sum', language: 'python', status: 'ACCEPTED', time: '06:42' },
    { id: 'sub-02', participant: 'Priya Sundaram', challenge: 'Find the Sum', language: 'cpp', status: 'ACCEPTED', time: '07:15' },
    { id: 'sub-03', participant: 'Rohit Verma', challenge: 'Reverse a String', language: 'c', status: 'WRONG_ANSWER', time: '11:20' },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 font-mono">
        <div>
          <h2 className="text-2xl font-black text-white">Live Submission Feed</h2>
          <p className="text-xs text-slate-400 mt-1">Audit log of student submissions</p>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Challenge</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {dummySubs.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold text-cyan-400">{s.id}</td>
                  <td className="px-4 py-3 text-white">{s.participant}</td>
                  <td className="px-4 py-3">{s.challenge}</td>
                  <td className="px-4 py-3 uppercase">{s.language}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      s.status === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
