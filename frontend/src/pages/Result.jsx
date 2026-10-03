import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import { useChallenge } from '../hooks/useChallenge';
import Button from '../components/common/Button';
import { Trophy, Award } from 'lucide-react';

export default function Result() {
  const navigate = useNavigate();
  const { participant } = useParticipant();
  const { challenge, finalResult, isTimeExpired, startChallenge } = useChallenge();

  useEffect(() => {
    if (!participant) {
      navigate('/register', { replace: true });
    }
  }, [participant, navigate]);

  if (!participant) {
    return null;
  }

  const isAccepted = finalResult?.status === 'ACCEPTED';
  const passedTests = finalResult?.passedCount ?? (isAccepted ? (finalResult?.totalCount || 3) : 0);
  const totalTests = finalResult?.totalCount ?? 3;

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-8 font-mono">
      <div className="space-y-4">
        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center shadow-2xl ${
            isAccepted
              ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-emerald-500/20'
              : 'bg-rose-500/20 border-2 border-rose-400 text-rose-400 shadow-rose-500/20'
          }`}
        >
          {isAccepted ? <Trophy className="w-10 h-10 animate-bounce" /> : <Award className="w-10 h-10" />}
        </div>

        <h1 className="text-3xl font-black text-white">
          {isAccepted ? '🏆 CHALLENGE COMPLETED' : isTimeExpired ? '⌛ TIME EXPIRED' : 'NOT ACCEPTED'}
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {isAccepted
            ? 'All test cases verified! Your solution and completion duration have been committed to the live leaderboard.'
            : 'Challenge session concluded. Review official rankings below.'}
        </p>
      </div>

      {/* RESULT METRICS CARD */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Participant</span>
          <p className="text-sm font-bold text-slate-200 truncate mt-1">{participant.name}</p>
          <span className="text-[10px] text-cyan-400 block">{participant.participantId}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Challenge</span>
          <p className="text-sm font-bold text-cyan-400 truncate mt-1">{challenge?.title || 'Active Challenge'}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Status</span>
          <p className={`text-sm font-bold mt-1 ${isAccepted ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isAccepted ? 'ACCEPTED' : (isTimeExpired ? 'TIME EXPIRED' : 'UNFINISHED')}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Tests Passed</span>
          <p className="text-sm font-bold text-white mt-1">
            {passedTests} / {totalTests}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            if (startChallenge) startChallenge();
            navigate('/challenge');
          }}
        >
          RESTART CHALLENGE
        </Button>
        <Link to="/leaderboard">
          <Button variant="secondary" size="lg">
            VIEW LEADERBOARD →
          </Button>
        </Link>
      </div>
    </div>
  );
}
