import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import { useChallenge } from '../hooks/useChallenge';
import { challengeApi } from '../services/challengeApi';
import Button from '../components/common/Button';
import { Trophy, Award, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export default function Result() {
  const navigate = useNavigate();
  const { participant } = useParticipant();
  const { challenge, finalResult, isTimeExpired, startChallenge, selectChallenge } = useChallenge();

  const [nextChallenge, setNextChallenge] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);

  useEffect(() => {
    if (!participant) {
      navigate('/register', { replace: true });
    }
  }, [participant, navigate]);

  const isAccepted = finalResult?.status === 'ACCEPTED';
  const passedTests = finalResult?.passedCount ?? (isAccepted ? (finalResult?.totalCount || 3) : 0);
  const totalTests = finalResult?.totalCount ?? 3;

  useEffect(() => {
    if (!isAccepted) return;
    let cancelled = false;

    async function loadProgression() {
      try {
        const res = await challengeApi.getProgress();
        if (cancelled) return;
        if (res.success && Array.isArray(res.progress)) {
          const allDone = res.progress.length > 0 && res.progress.every((p) => p.status === 'COMPLETED');
          setAllCompleted(allDone);

          const currentId = String(challenge?.id || challenge?.slug || '').toLowerCase();
          const currentItem = res.progress.find(
            (p) =>
              String(p.challengeId).toLowerCase() === currentId ||
              String(p.slug || '').toLowerCase() === currentId
          );
          const currentTier = currentItem ? currentItem.tier : 1;

          // Find the next tier challenge
          const next = res.progress.find((p) => p.tier === currentTier + 1);
          if (next) {
            setNextChallenge(next);
            sessionStorage.setItem('just_unlocked_tier', next.difficulty);
          }
        }
      } catch (err) {
        console.warn('Failed to load progress in Result.jsx:', err);
      }
    }

    loadProgression();
    return () => {
      cancelled = true;
    };
  }, [isAccepted, challenge?.id, challenge?.slug]);

  if (!participant) {
    return null;
  }

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

        {isAccepted && allCompleted && (
          <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/10">
            <span>🏆</span>
            <span>ALL CHALLENGES COMPLETED</span>
          </div>
        )}
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

      {/* ACTIONS */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        {isAccepted && nextChallenge && !allCompleted && (
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black shadow-lg shadow-cyan-500/30"
            onClick={() => {
              const nextId = nextChallenge.slug || nextChallenge.challengeId;
              selectChallenge(nextId);
              navigate(`/challenge?id=${nextId}`);
            }}
          >
            NEXT CHALLENGE ({nextChallenge.difficulty?.toUpperCase()}) →
          </Button>
        )}

        {isAccepted && allCompleted && (
          <Link to="/leaderboard">
            <Button
              variant="primary"
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30"
            >
              VIEW LEADERBOARD 🏆
            </Button>
          </Link>
        )}

        <Link to="/challenges">
          <Button variant="outline" size="lg">
            BROWSE CHALLENGES
          </Button>
        </Link>

        {!allCompleted && (
          <Link to="/leaderboard">
            <Button variant="secondary" size="lg">
              VIEW LEADERBOARD →
            </Button>
          </Link>
        )}

        <Button
          variant="outline"
          size="lg"
          className="text-slate-400 hover:text-white"
          onClick={() => {
            if (startChallenge) startChallenge();
            navigate(`/challenge?id=${challenge?.slug || challenge?.id}`);
          }}
        >
          <RotateCcw className="w-4 h-4 mr-1.5" /> REPLAY THIS
        </Button>
      </div>
    </div>
  );
}
