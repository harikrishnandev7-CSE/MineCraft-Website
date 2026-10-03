import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import {
  Radio,
  Clock,
  RefreshCw,
  PowerOff,
  PlusCircle,
  RotateCcw,
  AlertTriangle,
  Code,
  Users,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export default function AdminSessions({ isLiveMonitor = false }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [autoPoll, setAutoPoll] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await adminApi.getSessions();
      if (res.success) {
        setSessions(res.sessions);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setAutoPoll(false);
        return;
      }
      setToast({ message: 'Failed to fetch sessions from server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    let interval = null;
    if (autoPoll) {
      interval = setInterval(fetchSessions, 5000);
    }
    const stopPoll = () => setAutoPoll(false);
    window.addEventListener('mindcraft_auth_expired', stopPoll);
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('mindcraft_auth_expired', stopPoll);
    };
  }, [autoPoll]);

  const handleEndSession = async (id, participantName) => {
    if (!window.confirm(`Force terminate active session for contestant ${participantName}?`)) return;
    try {
      const res = await adminApi.endSession(id);
      if (res.success) {
        setToast({ message: 'Session closed', type: 'warning' });
        fetchSessions();
      }
    } catch (err) {
      setToast({ message: 'Failed to end session', type: 'error' });
    }
  };

  const handleExtendSession = async (id, minutes) => {
    try {
      const res = await adminApi.extendSession(id, minutes);
      if (res.success) {
        setToast({ message: `Added +${minutes} minutes to session`, type: 'success' });
        fetchSessions();
      }
    } catch (err) {
      setToast({ message: 'Failed to extend session', type: 'error' });
    }
  };

  const handleResetSession = async (id, participantName) => {
    if (!window.confirm(`Reset countdown timer and progress for ${participantName}?`)) return;
    try {
      const res = await adminApi.resetSession(id);
      if (res.success) {
        setToast({ message: 'Session reset successfully', type: 'info' });
        fetchSessions();
      }
    } catch (err) {
      setToast({ message: 'Reset failed', type: 'error' });
    }
  };

  const activeCount = sessions.filter((s) => !s.isCompleted && s.status === 'ACTIVE').length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-mono text-slate-800">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-wider flex items-center gap-2">
              <Radio className="w-6 h-6 text-orange-400" />
              {isLiveMonitor ? 'REAL-TIME COMPETITION SURVEILLANCE' : 'ACTIVE CONTESTANT SESSIONS'}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Surveillance matrix monitoring contestant countdowns, reveals, placed blocks, and heartbeat activity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoPoll(!autoPoll)}
              className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 font-bold transition ${
                autoPoll
                  ? 'bg-cyan-950/60 border-cyan-800 text-orange-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoPoll ? 'bg-orange-400 animate-ping' : 'bg-slate-600'}`}></span>
              <span>{autoPoll ? 'Live Auto-Polling Active' : 'Auto-Poll Paused'}</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchSessions}
              disabled={loading}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-600 uppercase font-bold">Total Sessions</span>
            <div className="text-2xl font-black text-slate-900">{sessions.length}</div>
          </div>

          <div className="p-4 bg-white border border-cyan-800/40 rounded-xl space-y-1">
            <span className="text-[10px] text-orange-400 uppercase font-bold">Active Contestants</span>
            <div className="text-2xl font-black text-cyan-300">{activeCount}</div>
          </div>

          <div className="p-4 bg-white border border-emerald-800/40 rounded-xl space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Completed Runs</span>
            <div className="text-2xl font-black text-emerald-400">
              {sessions.filter((s) => s.isCompleted).length}
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-600 uppercase font-bold">Polling Cycle</span>
            <div className="text-2xl font-black text-slate-700">4.0s</div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white/90 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Contestant</th>
                  <th className="px-4 py-3.5">Active Challenge</th>
                  <th className="px-4 py-3.5">Time Remaining</th>
                  <th className="px-4 py-3.5">Current Score</th>
                  <th className="px-4 py-3.5">Reveals Used</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Last Activity</th>
                  <th className="px-4 py-3.5 text-right">Emergency Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-700">
                {loading && sessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-600">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-orange-400" />
                      Loading active sessions...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">
                      No sessions currently active in the arena.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-100/40 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-sm">{s.participant}</div>
                        <div className="text-[10px] text-orange-400/80 font-mono">
                          {s.college} • {s.email}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-cyan-300">
                        {s.challenge}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {s.timeRemaining}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                        {s.currentScore} PTS
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{s.blocksRevealed} reveals</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            s.status === 'ACTIVE'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60 animate-pulse'
                              : s.status === 'COMPLETED'
                              ? 'bg-cyan-950 text-orange-400 border border-cyan-800/60'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px]">
                        {new Date(s.lastActivityAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleExtendSession(s._id, 5)}
                            title="Add +5 Minutes"
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-cyan-300 text-[10px] font-bold rounded-lg transition"
                          >
                            +5m
                          </button>

                          <button
                            onClick={() => handleExtendSession(s._id, 10)}
                            title="Add +10 Minutes"
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-cyan-300 text-[10px] font-bold rounded-lg transition"
                          >
                            +10m
                          </button>

                          <button
                            onClick={() => handleResetSession(s._id, s.participant)}
                            title="Reset Timer and Progress"
                            className="p-1.5 hover:bg-slate-100 text-amber-400 rounded-lg transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {!s.isCompleted && (
                            <button
                              onClick={() => handleEndSession(s._id, s.participant)}
                              title="Force Terminate Session"
                              className="p-1.5 hover:bg-rose-950 text-rose-400 rounded-lg transition"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
