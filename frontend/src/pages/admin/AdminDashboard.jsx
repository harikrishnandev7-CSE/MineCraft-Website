import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import {
  Users,
  Code2,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Send,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  Trophy,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOverview();
      if (res.success) {
        setData(res);
        setError(null);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Auth expired, abort polling cleanly
        return;
      }
      console.error('Failed to load admin stats:', err);
      setError('Failed to connect to backend server. Make sure MongoDB and backend API are running.');
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 10000);
    const stopPolling = () => clearInterval(interval);
    window.addEventListener('mindcraft_auth_expired', stopPolling);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mindcraft_auth_expired', stopPolling);
    };
  }, []);

  const stats = data?.stats || {
    totalParticipants: 0,
    activeParticipants: 0,
    totalChallenges: 0,
    publishedChallenges: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
    wrongAnswers: 0,
    activeSessions: 0,
  };

  const statCards = [
    { title: 'Total Participants', count: stats.totalParticipants, icon: Users, color: 'text-orange-400', bg: 'bg-blue-950/20 border-blue-800/40' },
    { title: 'Active Participants', count: stats.activeParticipants, icon: Radio, color: 'text-orange-400', bg: 'bg-cyan-950/20 border-cyan-800/40' },
    { title: 'Total Challenges', count: stats.totalChallenges, icon: Code2, color: 'text-indigo-400', bg: 'bg-indigo-950/20 border-indigo-800/40' },
    { title: 'Published Challenges', count: stats.publishedChallenges, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-800/40' },
    { title: 'Total Submissions', count: stats.totalSubmissions, icon: Send, color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-800/40' },
    { title: 'Accepted Solutions', count: stats.acceptedSubmissions, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-800/40' },
    { title: 'Wrong Answers', count: stats.wrongAnswers, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-950/20 border-rose-800/40' },
    { title: 'Active Sessions', count: stats.activeSessions, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-800/40' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-mono text-slate-800">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              COMMAND CENTER GATEWAY
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Live telemetry, real-time participant surveillance & competition management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500">
              Auto-sync: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchOverview}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs flex items-center gap-1.5 text-orange-400 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 8 Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border ${card.bg} transition hover:scale-[1.01]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">
                    {card.title}
                  </span>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-slate-900 mt-2">
                  {card.count}
                </div>
              </div>
            );
          })}
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            QUICK ACTIONS & TOOLS
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            <Link
              to="/admin/challenges/create"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <PlusCircle className="w-5 h-5 text-orange-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">New Challenge</span>
            </Link>

            <Link
              to="/admin/challenges"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <Code2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">Challenges</span>
            </Link>

            <Link
              to="/admin/live"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <Radio className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">Live Monitor</span>
            </Link>

            <Link
              to="/admin/sessions"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <Clock className="w-5 h-5 text-amber-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">Sessions</span>
            </Link>

            <Link
              to="/admin/participants"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <Users className="w-5 h-5 text-orange-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">Participants</span>
            </Link>

            <Link
              to="/admin/submissions"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <Send className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">Submissions</span>
            </Link>

            <Link
              to="/admin/results"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">Exports</span>
            </Link>

            <Link
              to="/admin/settings"
              className="p-3 bg-white border border-slate-200 hover:border-orange-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-center group transition"
            >
              <Settings className="w-5 h-5 text-slate-600 group-hover:scale-110 transition" />
              <span className="text-[11px] text-slate-700 font-semibold">Settings</span>
            </Link>
          </div>
        </div>

        {/* LIVE COMPETITION MONITOR PANEL */}
        <div className="p-6 bg-white/90 border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                LIVE ARENA SURVEILLANCE ({data?.liveSessions?.length || 0})
              </h3>
            </div>
            <Link to="/admin/live" className="text-xs text-orange-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
              Open Full Monitor →
            </Link>
          </div>

          {(!data?.liveSessions || data.liveSessions.length === 0) ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No active participant sessions right now. Active contestants will appear here automatically with real-time countdown and reveal counters.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Current Challenge</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Time Left</th>
                    <th className="px-4 py-3">Reveals Used</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-700">
                  {data.liveSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-100/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{session.participantName}</div>
                        <div className="text-[10px] text-slate-500">{session.participantEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-orange-400 font-semibold">{session.challengeTitle}</td>
                      <td className="px-4 py-3 font-bold text-emerald-400">{session.currentScore} PTS</td>
                      <td className="px-4 py-3 text-amber-400 font-bold">{session.timeRemaining}</td>
                      <td className="px-4 py-3">{session.revealsCount} reveals</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-orange-400 border border-cyan-800/50">
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RECENT SUBMISSIONS TABLE */}
        <div className="p-6 bg-white/90 border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              RECENT SUBMISSIONS FEED
            </h3>
            <Link to="/admin/submissions" className="text-xs text-orange-400 hover:text-cyan-300 font-semibold">
              View All Submissions →
            </Link>
          </div>

          {(!data?.recentSubmissions || data.recentSubmissions.length === 0) ? (
            <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
              No recent submissions recorded yet.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Challenge</th>
                    <th className="px-4 py-3">Language</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Execution</th>
                    <th className="px-4 py-3">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-700">
                  {data.recentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-100/40">
                      <td className="px-4 py-3 text-slate-900 font-semibold">{sub.participant}</td>
                      <td className="px-4 py-3 text-orange-400">{sub.challenge}</td>
                      <td className="px-4 py-3 uppercase text-slate-600">{sub.language}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            sub.status === 'ACCEPTED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{sub.score}</td>
                      <td className="px-4 py-3 text-slate-600">{sub.executionTime}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(sub.submittedAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
