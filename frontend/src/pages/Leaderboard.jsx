import React, { useMemo } from 'react';
import { useParticipant } from '../context/ParticipantContext';
import { useChallenge } from '../hooks/useChallenge';
import { INITIAL_LEADERBOARD } from '../data/leaderboard';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';
import Podium from '../components/leaderboard/Podium';
import { Trophy, Users } from 'lucide-react';

export default function Leaderboard() {
  const { participant } = useParticipant();
  const { finalResult, challenge } = useChallenge();

  const fullLeaderboard = useMemo(() => {
    let board = [...INITIAL_LEADERBOARD];

    // If current participant has an accepted submission, insert into board
    if (finalResult && finalResult.status === 'ACCEPTED' && participant) {
      const alreadyIn = board.some((b) => b.participantId === participant.participantId);
      if (!alreadyIn) {
        board.push({
          id: 'lead-me',
          name: participant.name,
          participantId: participant.participantId,
          college: participant.college,
          challengeTitle: challenge.title,
          status: 'Accepted',
          timeSeconds: 522, // 08:42
          timeFormatted: "08:42",
          score: challenge.points || 100,
          testsPassed: "3 / 3",
        });
      }
    }

    // Sort by time
    board.sort((a, b) => a.timeSeconds - b.timeSeconds);

    // Reassign ranks
    return board.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [finalResult, participant, challenge]);

  const topThree = fullLeaderboard.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 font-mono">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-orange-500/40 text-cyan-300 text-xs">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>TOURNAMENT STANDINGS</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800">Live Leaderboard</h1>
        <p className="text-xs text-slate-600">
          Rankings computed dynamically based on accepted tests and elapsed time
        </p>
      </div>

      {/* TOP 3 PODIUM */}
      <Podium topThree={topThree} />

      {/* FULL LEADERBOARD TABLE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span className="flex items-center gap-1.5 font-bold">
            <Users className="w-4 h-4 text-orange-400" /> Total Ranked Participants: {fullLeaderboard.length}
          </span>
          <span>Rank formula: Correctness → Earliest Timestamp</span>
        </div>
        <LeaderboardTable
          rankings={fullLeaderboard}
          currentParticipantId={participant?.participantId}
        />
      </div>
    </div>
  );
}
