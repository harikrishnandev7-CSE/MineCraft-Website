import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { INITIAL_PARTICIPANTS } from '../../data/participants';

export default function AdminParticipants() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6 font-mono">
        <div>
          <h2 className="text-2xl font-black text-white">Participant Roster</h2>
          <p className="text-xs text-slate-400 mt-1">Registered contestants across institutions</p>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {INITIAL_PARTICIPANTS.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-bold text-cyan-400">{p.participantId}</td>
                  <td className="px-4 py-3 text-white">{p.name}</td>
                  <td className="px-4 py-3">{p.college}</td>
                  <td className="px-4 py-3 text-slate-400">{p.department}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      p.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
