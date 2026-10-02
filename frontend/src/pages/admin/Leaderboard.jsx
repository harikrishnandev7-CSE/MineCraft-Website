import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import {
  Trophy,
  RefreshCw,
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Medal,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export default function AdminLeaderboard() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getLeaderboard();
      if (res.success) {
        setRankings(res.rankings);
      }
    } catch (err) {
      setToast({ message: 'Failed to load leaderboard', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      await adminApi.downloadExcel();
      setToast({ message: 'Excel scorecard downloaded successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to generate Excel file', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      await adminApi.downloadPdf();
      setToast({ message: 'PDF report downloaded successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to generate PDF document', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const filteredRankings = rankings.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.college?.toLowerCase().includes(term) ||
      r.participantId?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex min-h-screen bg-slate-950 font-mono text-slate-200">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-wider flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              OFFICIAL COMPETITION LEADERBOARD
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic rank calculation based on test case weights, reveal deductions, and completion speed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchLeaderboard}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              variant="emerald"
              size="sm"
              icon={FileSpreadsheet}
              onClick={handleExportExcel}
              disabled={exporting}
            >
              Export Excel
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={FileText}
              onClick={handleExportPdf}
              disabled={exporting}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Podium Highlight */}
        {rankings.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rank 2 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2 order-2 md:order-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-300">
                #2
              </div>
              <div className="font-bold text-white text-sm">{rankings[1]?.name}</div>
              <div className="text-[11px] text-slate-400">{rankings[1]?.college}</div>
              <div className="text-xl font-black text-cyan-400">{rankings[1]?.totalScore} PTS</div>
            </div>

            {/* Rank 1 */}
            <div className="p-5 bg-gradient-to-b from-amber-950/30 to-slate-900 border border-amber-500/40 rounded-2xl text-center space-y-2 order-1 md:order-2 shadow-lg shadow-amber-950/20">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-500/60 flex items-center justify-center font-black text-amber-300 text-lg">
                <Medal className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest">
                Current Champion
              </span>
              <div className="font-black text-white text-base">{rankings[0]?.name}</div>
              <div className="text-[11px] text-slate-400">{rankings[0]?.college}</div>
              <div className="text-2xl font-black text-emerald-400">{rankings[0]?.totalScore} PTS</div>
            </div>

            {/* Rank 3 */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-2 order-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center font-black text-amber-600">
                #3
              </div>
              <div className="font-bold text-white text-sm">{rankings[2]?.name}</div>
              <div className="text-[11px] text-slate-400">{rankings[2]?.college}</div>
              <div className="text-xl font-black text-cyan-400">{rankings[2]?.totalScore} PTS</div>
            </div>
          </div>
        )}

        {/* Filter bar */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contestant name or college..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="text-slate-400 text-xs">
            Contestants: <strong className="text-white">{filteredRankings.length}</strong>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Rank</th>
                  <th className="px-4 py-3.5">Participant</th>
                  <th className="px-4 py-3.5">College</th>
                  <th className="px-4 py-3.5">Total Score</th>
                  <th className="px-4 py-3.5">Challenges Solved</th>
                  <th className="px-4 py-3.5">Accuracy</th>
                  <th className="px-4 py-3.5">Penalties</th>
                  <th className="px-4 py-3.5">Time Taken</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                      Computing official ranks...
                    </td>
                  </tr>
                ) : filteredRankings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-500">
                      No participants on the leaderboard yet.
                    </td>
                  </tr>
                ) : (
                  filteredRankings.map((r) => (
                    <tr key={r.rank} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-black text-sm ${
                            r.rank === 1
                              ? 'text-amber-400'
                              : r.rank === 2
                              ? 'text-slate-300'
                              : r.rank === 3
                              ? 'text-amber-600'
                              : 'text-cyan-400'
                          }`}
                        >
                          #{r.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white text-sm">{r.name}</div>
                        <div className="text-[10px] text-cyan-400/80 font-mono">{r.participantId}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {r.college}
                      </td>
                      <td className="px-4 py-3.5 font-black text-emerald-400 text-sm">
                        {r.totalScore} PTS
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white">
                        {r.challengesSolved}
                      </td>
                      <td className="px-4 py-3.5 text-cyan-300 font-semibold">
                        {r.accuracy}
                      </td>
                      <td className="px-4 py-3.5 text-rose-400 font-bold">
                        -{r.penalties}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-semibold">
                        {r.timeFormatted}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            r.status === 'Completed'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : r.status === 'Active'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </main>
    </div>
  );
}
