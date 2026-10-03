import React, { useState, useEffect } from 'react';
import { useParticipant } from '../context/ParticipantContext';
import { leaderboardApi } from '../services/leaderboardApi';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import Podium from '../components/leaderboard/Podium';
import { Trophy, Users, RefreshCw } from 'lucide-react';

export default function Leaderboard() {
  const { participant } = useParticipant();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchLeaderboard = async () => {
    try {
      const res = await leaderboardApi.getLiveLeaderboard();
      if (res.success && Array.isArray(res.rankings)) {
        setRankings(res.rankings);
      }
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    const stopPolling = () => clearInterval(interval);
    window.addEventListener('mindcraft_auth_expired', stopPolling);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mindcraft_auth_expired', stopPolling);
    };
  }, []);

  const topThree = rankings.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 font-mono">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>TOURNAMENT STANDINGS</span>
        </div>
        <h1 className="text-3xl font-black text-white">Live Leaderboard</h1>
        <p className="text-xs text-slate-400">
          Rankings computed dynamically based on accepted tests and elapsed time
        </p>
        <div className="text-[11px] text-slate-500 flex items-center justify-center gap-2 pt-1">
          <span>Auto-sync: {lastRefreshed.toLocaleTimeString()}</span>
          <button
            onClick={fetchLeaderboard}
            className="text-cyan-400 hover:text-cyan-300 transition"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM */}
      {topThree.length >= 3 && <Podium topThree={topThree} />}

      {/* FULL LEADERBOARD TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="flex items-center gap-1.5 font-bold">
            <Users className="w-4 h-4 text-cyan-400" /> Total Ranked Participants: {rankings.length}
          </span>
          <span>Rank formula: Score desc → Total Time asc → Earliest Acceptance</span>
        </div>
        <LeaderboardTable
          rankings={rankings}
          currentParticipantId={participant?.participantId}
        />
      </div>
    </div>
  );
}
