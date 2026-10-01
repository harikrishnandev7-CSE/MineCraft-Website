import React from 'react';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import RankCard from '../components/leaderboard/RankCard';

export default function Leaderboard() {
  const dummyRankings = [
    { id: 1, teamName: 'NullPointers', totalScore: 450, challengesSolved: 3, timeFormatted: '28m 10s' },
    { id: 2, teamName: 'ByteBusters', totalScore: 350, challengesSolved: 2, timeFormatted: '31m 45s' },
    { id: 3, teamName: 'BinaryKnights', totalScore: 300, challengesSolved: 2, timeFormatted: '35m 12s' },
    { id: 4, teamName: 'SyntaxErrors', totalScore: 150, challengesSolved: 1, timeFormatted: '18m 04s' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Live Leaderboard</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time standings updated across all arena submissions</p>
      </div>

      <RankCard rank={2} teamName="ByteBusters" score={350} pointsBehind={100} />

      <LeaderboardTable rankings={dummyRankings} />
    </div>
  );
}
