import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useChallenge } from '../hooks/useChallenge';
import { useParticipant } from '../context/ParticipantContext';
import { challengeApi } from '../services/challengeApi';
import { sessionApi } from '../services/sessionApi';
import Toast from '../components/common/Toast';
import MissionStepper from '../components/challenge/MissionStepper';
import {
  Trophy,
  CheckCircle2,
  Lock,
  ArrowRight,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Clock,
  Terminal,
  ShieldCheck,
  UserPlus,
  Flame,
} from 'lucide-react';

export default function Challenges() {
  const navigate = useNavigate();
  const location = useLocation();
  const { participant } = useParticipant();
  const { selectChallenge } = useChallenge();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  // Handle incoming lock or completion error from navigation state
  useEffect(() => {
    if (location.state?.lockError) {
      setToastMessage(location.state.lockError);
      setToastType('error');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Load challenges, progress, and active sessions
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const [challengesRes, progRes, sessRes] = await Promise.all([
          challengeApi.getAll().catch(() => ({ success: false, challenges: [] })),
          participant ? challengeApi.getProgress().catch(() => null) : Promise.resolve(null),
          participant ? sessionApi.getUserSessions().catch(() => null) : Promise.resolve(null),
        ]);

        if (cancelled) return;

        let serverList = [];
        if (challengesRes && challengesRes.success && Array.isArray(challengesRes.challenges)) {
          serverList = challengesRes.challenges;
        }

        if (progRes && progRes.success) {
          setProgressData(progRes);
        }

        if (sessRes && sessRes.success && Array.isArray(sessRes.sessions)) {
          setActiveSessions(sessRes.sessions.filter((s) => s.status === 'ACTIVE' && !s.isCompleted));
        }

        setChallenges(serverList);
      } catch (err) {
        console.error('Failed to load roadmap data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [participant]);

  // Map the 3 canonical challenges into roadmap steps (Easy -> Medium -> Hard)
  const roadmapSteps = useMemo(() => {
    const list = [...challenges].sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

    return list.map((c, idx) => {
      const seq = c.sequenceOrder || idx + 1;
      let status = 'LOCKED';
      let previousTitle = '';

      if (idx > 0 && list[idx - 1]) {
        previousTitle = list[idx - 1].title;
      }

      if (participant && progressData?.progress) {
        const item = progressData.progress.find(
          (p) =>
            String(p.challengeId).toLowerCase() === String(c._id).toLowerCase() ||
            String(p.slug || '').toLowerCase() === String(c.slug || '').toLowerCase()
        );
        if (item) {
          status = item.status; // 'COMPLETED' | 'CURRENT' | 'LOCKED'
        }
      } else if (!participant) {
        // Guest / unregistered: Step 1 is available to preview, Step 2 & 3 locked
        status = seq === 1 ? 'CURRENT' : 'LOCKED';
      }

      // Check for active session on this challenge
      const hasActiveSession = activeSessions.some((s) => {
        const sessChalId = typeof s.challengeId === 'object' ? s.challengeId?._id : s.challengeId;
        return (
          String(sessChalId).toLowerCase() === String(c._id).toLowerCase() ||
          String(s.challengeId?.slug || '').toLowerCase() === String(c.slug || '').toLowerCase()
        );
      });

      const tasksCount = Array.isArray(c.tasks) ? c.tasks.length : 3;
      const blocksCount = c.languageConfigs?.[0]?.blockCount || tasksCount;
      const durationMin = Math.round((c.timeLimitSeconds || 1200) / 60);

      return {
        ...c,
        sequenceOrder: seq,
        status,
        previousTitle,
        hasActiveSession,
        tasksCount,
        blocksCount,
        durationMin,
      };
    });
  }, [challenges, progressData, activeSessions, participant]);

  const completedCount = useMemo(() => {
    return roadmapSteps.filter((s) => s.status === 'COMPLETED').length;
  }, [roadmapSteps]);

  const earnedPoints = useMemo(() => {
    return roadmapSteps
      .filter((s) => s.status === 'COMPLETED')
      .reduce((sum, s) => sum + (Number(s.points) || 0), 0);
  }, [roadmapSteps]);

  const totalPoints = useMemo(() => {
    return roadmapSteps.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
  }, [roadmapSteps]);

  const allCompleted = progressData?.allCompleted || completedCount === 3;

  const handleStartChallenge = (step) => {
    if (!participant) {
      navigate('/register');
      return;
    }
    const targetSlug = step.slug || step._id;
    selectChallenge(targetSlug);
    navigate(`/challenge?id=${targetSlug}`);
  };

  const getDifficultyBadge = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'hard':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/40';
      case 'medium':
      default:
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-mono py-8 px-4 sm:px-6 lg:px-8">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* ── HEADER BANNER ── */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-widest">
                <Layers className="w-3.5 h-3.5" /> LINEAR ARENA SEQUENCE
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 tracking-tight">
                MISSION ROADMAP
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Progress through a strict linear sequence: Easy first, unlock Medium upon acceptance, then Hard.
                Challenges cannot be skipped or chosen freely.
              </p>
            </div>

            {/* Header Stats */}
            <div className="flex flex-row md:flex-col gap-3 min-w-[200px] w-full md:w-auto">
              <div className="flex-1 md:flex-initial p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
                </span>
                <span className="text-sm font-black text-emerald-400">
                  {completedCount} / 3
                </span>
              </div>
              <div className="flex-1 md:flex-initial p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Points Earned
                </span>
                <span className="text-sm font-black text-amber-400">
                  {earnedPoints} <span className="text-[10px] text-slate-500">/ {totalPoints || 600}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TOP-LEVEL STEPPER ── */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-lg">
          <MissionStepper
            progress={roadmapSteps.map((s) => ({
              sequenceOrder: s.sequenceOrder,
              difficulty: s.difficulty,
              status: s.status,
              title: s.title,
            }))}
          />
        </div>

        {/* ── GUEST / UNREGISTERED NOTICE ── */}
        {!participant && (
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Contestant Registration Required</h4>
                <p className="text-[11px] text-slate-400 font-sans">
                  Register your ID to begin the Easy challenge and record your official tournament leaderboard time.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider transition shrink-0 flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              REGISTER TO BEGIN <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── ALL CHALLENGES COMPLETED BANNER ── */}
        {allCompleted && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shrink-0">
                🏆
              </div>
              <div>
                <h3 className="text-sm font-black text-white">ALL CHALLENGES COMPLETED</h3>
                <p className="text-xs text-amber-200/80 font-sans">
                  You have successfully solved the entire Mind Craft mission track with {earnedPoints} points!
                </p>
              </div>
            </div>
            <Link
              to="/leaderboard"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider transition shrink-0"
            >
              VIEW FINAL STANDINGS
            </Link>
          </div>
        )}

        {/* ── ROADMAP 3 STEPS ── */}
        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse h-36"
              />
            ))
          ) : (
            roadmapSteps.map((step) => {
              const isCompleted = step.status === 'COMPLETED';
              const isCurrent = step.status === 'CURRENT';
              const isLocked = step.status === 'LOCKED';

              return (
                <div
                  key={step.slug || step._id}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                    isCompleted
                      ? 'bg-slate-900/60 border-emerald-500/40 shadow-md shadow-emerald-950/20'
                      : isCurrent
                      ? 'bg-slate-900/90 border-cyan-500/70 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                  }`}
                >
                  {/* Left: Step Info */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/30'
                          : 'bg-slate-900 text-slate-600 border-slate-800'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : isLocked ? <Lock className="w-4 h-4 text-slate-600" /> : step.sequenceOrder}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-bold uppercase">
                          Step {step.sequenceOrder}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getDifficultyBadge(
                            step.difficulty
                          )}`}
                        >
                          {step.difficulty}
                        </span>
                        <span className="text-[10px] text-amber-400 font-black flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-400" />
                          {step.points} PTS
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {step.durationMin}m
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {step.title}
                      </h2>

                      <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
                        {step.description}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>{step.tasksCount} Progressive Tasks</span>
                        <span>•</span>
                        <span>{step.blocksCount} Code Fragments</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Area */}
                  <div className="shrink-0 w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                    {isCompleted && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completed ✓</span>
                      </div>
                    )}

                    {isCurrent && participant && (
                      <button
                        onClick={() => handleStartChallenge(step)}
                        className="w-full md:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-black text-xs tracking-wider uppercase transition shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>{step.hasActiveSession ? 'RESUME ARENA' : 'START'}</span>
                      </button>
                    )}

                    {isCurrent && !participant && (
                      <Link
                        to="/register"
                        className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5"
                      >
                        <span>Register to begin</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {isLocked && (
                      <div className="inline-flex items-center gap-2 text-xs text-slate-500 italic">
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                        <span>Complete {step.previousTitle || 'previous challenge'} to unlock</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
