import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useChallenge } from '../hooks/useChallenge';
import { useParticipant } from '../context/ParticipantContext';
import { challengeApi } from '../services/challengeApi';
import Toast from '../components/common/Toast';
import {
  Trophy,
  Clock,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
  Code2,
  UserCheck,
  Shield,
  Lock,
  Unlock,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

const LANGUAGE_LABELS = {
  python: { name: 'Python 3', icon: '🐍' },
  java: { name: 'Java 17', icon: '☕' },
  cpp: { name: 'C++ 17', icon: '⚡' },
  c: { name: 'C', icon: '🔵' },
  javascript: { name: 'JavaScript', icon: '🟨' },
};

export default function Challenges() {
  const navigate = useNavigate();
  const location = useLocation();
  const { participant } = useParticipant();
  const { challenge: activeChallenge, selectChallenge } = useChallenge();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [enforceProgression, setEnforceProgression] = useState(true);
  const [needRegisterAlert, setNeedRegisterAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  // ── Handle incoming lock error or unlock announcements ──
  useEffect(() => {
    if (location.state?.lockError) {
      setToastMessage(location.state.lockError);
      setToastType('error');
      window.history.replaceState({}, document.title);
    }

    const justUnlocked = sessionStorage.getItem('just_unlocked_tier');
    if (justUnlocked) {
      setToastMessage(`🔓 ${justUnlocked} Challenge Unlocked! Good luck.`);
      setToastType('success');
      sessionStorage.removeItem('just_unlocked_tier');
    }
  }, [location.state]);

  // ── Load challenges and progress ──
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const [challengesRes, progressRes] = await Promise.all([
          challengeApi.getAll().catch(() => ({ success: false, challenges: [] })),
          participant ? challengeApi.getProgress().catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        let serverList = [];
        if (challengesRes && challengesRes.success && Array.isArray(challengesRes.challenges)) {
          serverList = challengesRes.challenges;
        }

        let progressList = [];
        if (progressRes && progressRes.success && Array.isArray(progressRes.progress)) {
          progressList = progressRes.progress;
          setEnforceProgression(progressRes.enforceProgression !== false);
          setUserProgress(progressList);
        }

        const mappedServer = serverList.map((sc) => {
          const langs = sc.supportedLanguages && sc.supportedLanguages.length > 0
            ? sc.supportedLanguages
            : sc.languageConfigs && sc.languageConfigs.length > 0
            ? sc.languageConfigs.map((lc) => lc.language)
            : ['python', 'java', 'cpp', 'c'];

          const tasksCount = Array.isArray(sc.tasks) ? sc.tasks.length : 4;
          const blocksCount = sc.languageConfigs?.[0]?.blockCount || tasksCount;

          let status = 'UNLOCKED';
          let lockedReason = '';
          const diffLower = (sc.difficulty || '').toLowerCase();
          const tier = diffLower === 'easy' ? 1 : diffLower === 'medium' ? 2 : 3;

          if (participant && progressList.length > 0) {
            const prog = progressList.find(
              (p) =>
                String(p.challengeId).toLowerCase() === String(sc._id).toLowerCase() ||
                String(p.slug || '').toLowerCase() === String(sc.slug || '').toLowerCase()
            );
            if (prog) {
              status = prog.status;
              lockedReason = prog.lockedReason;
            }
          } else if (!participant) {
            // Unregistered participant: Easy available, Medium & Hard locked
            if (tier > 1) {
              status = 'LOCKED';
              lockedReason = 'Register & complete Easy first to unlock.';
            } else {
              status = 'UNLOCKED';
            }
          }

          return {
            id: sc.slug || sc._id,
            slug: sc.slug || sc._id,
            _id: sc._id,
            title: sc.title,
            description: sc.description || '',
            category: sc.category || 'Algorithms',
            difficulty: sc.difficulty || 'Medium',
            tier,
            points: sc.points ?? 100,
            duration: sc.timeLimitSeconds || 1200,
            tasksCount,
            blocksCount,
            supportedLanguages: langs,
            status,
            lockedReason,
            isBackend: true,
          };
        });

        mappedServer.sort((a, b) => a.tier - b.tier);
        setChallenges(mappedServer);
      } catch (err) {
        console.error('Failed to load challenges from backend API:', err);
        if (!cancelled) setChallenges([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [participant]);

  // ── Stats ──
  const totalPoints = useMemo(() => {
    return challenges.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
  }, [challenges]);

  const completedCount = useMemo(() => {
    return challenges.filter((c) => c.status === 'COMPLETED').length;
  }, [challenges]);

  const earnedPoints = useMemo(() => {
    return challenges
      .filter((c) => c.status === 'COMPLETED')
      .reduce((sum, c) => sum + (Number(c.points) || 0), 0);
  }, [challenges]);

  // ── Stepper Tier States ──
  const tierStates = useMemo(() => {
    const tiers = [
      { tier: 1, name: 'Easy' },
      { tier: 2, name: 'Medium' },
      { tier: 3, name: 'Hard' },
    ];

    return tiers.map(({ tier, name }) => {
      const items = challenges.filter((c) => c.tier === tier);
      if (items.length === 0) return { tier, name, state: 'locked' };

      const allDone = items.every((c) => c.status === 'COMPLETED');
      if (allDone) return { tier, name, state: 'done' };

      const anyUnlocked = items.some((c) => c.status === 'UNLOCKED');
      if (anyUnlocked) return { tier, name, state: 'current' };

      return { tier, name, state: 'locked' };
    });
  }, [challenges]);

  // ── Handler: Solve Challenge ──
  const handleSolve = (challenge) => {
    if (challenge.status === 'LOCKED') {
      setToastMessage(challenge.lockedReason || 'This challenge is locked. Complete previous tiers first.');
      setToastType('warning');
      return;
    }

    if (!participant) {
      setNeedRegisterAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetId = challenge.slug || challenge.id;
    selectChallenge(targetId);
    navigate(`/challenge?id=${targetId}`);
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
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── HEADER BANNER ── */}
        <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-widest">
                <Cpu className="w-3.5 h-3.5" /> MIND CRAFT // ARENA PROTOCOL
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
                CHOOSE YOUR CHALLENGE
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Progress sequentially through the tiers: complete Easy to unlock Medium, and solve Medium to unlock Hard.
                Crack tasks to recover fragments, reassemble the code, and clear all test cases.
              </p>
            </div>

            {/* Header Stats Pills */}
            <div className="flex flex-wrap sm:flex-col gap-3 min-w-[220px]">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
                </span>
                <span className="text-base font-black text-emerald-400">
                  {completedCount} / {challenges.length || 3}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Points Earned
                </span>
                <span className="text-base font-black text-amber-400">
                  {earnedPoints} <span className="text-xs text-slate-500">/ {totalPoints} PTS</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── PROGRESS STEPPER ── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Sequential Tier Progression
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {enforceProgression ? 'Enforced: Easy → Medium → Hard' : 'Open Arena: All Unlocked'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {tierStates.map((step, idx) => {
              const isDone = step.state === 'done';
              const isCurrent = step.state === 'current';
              const isLocked = step.state === 'locked';

              return (
                <React.Fragment key={step.tier}>
                  <div
                    className={`flex-1 p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/50 animate-pulse'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isCurrent
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'bg-slate-900 border border-slate-800 text-slate-600'
                        }`}
                      >
                        {isDone ? '✓' : step.tier}
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider">
                          Tier {step.tier}: {step.name}
                        </div>
                        <div className="text-[10px] opacity-80 font-sans">
                          {isDone ? 'Fully Solved' : isCurrent ? 'Available to Solve' : 'Locked Tier'}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-xs">
                      {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {isCurrent && <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">CURRENT</span>}
                      {isLocked && <Lock className="w-4 h-4 text-slate-600" />}
                    </div>
                  </div>

                  {idx < tierStates.length - 1 && (
                    <div className="hidden sm:flex text-slate-600 font-bold px-1">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── NOT REGISTERED NOTICE ── */}
        {needRegisterAlert && !participant && (
          <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-200">Registration Required to Solve</h4>
                <p className="text-xs text-amber-300/80 font-sans">
                  Please register your contestant ID so your progress, score, and leaderboard ranking are recorded.
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider transition shrink-0 flex items-center gap-1.5"
            >
              REGISTER NOW <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── CHALLENGE CARDS GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse space-y-4 h-80"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 w-20 bg-slate-800 rounded-md" />
                  <div className="h-5 w-16 bg-slate-800 rounded-md" />
                </div>
                <div className="h-6 w-3/4 bg-slate-800 rounded-md" />
                <div className="h-16 w-full bg-slate-800/60 rounded-md" />
                <div className="h-10 w-full bg-slate-800 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : challenges.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-4">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">No Challenges Available</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              There are currently no active challenges published. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((c) => {
              const isCurrent = activeChallenge && (activeChallenge.id === c.id || activeChallenge.slug === c.slug);
              const durationMin = Math.round(c.duration / 60);
              const isLocked = c.status === 'LOCKED';
              const isCompleted = c.status === 'COMPLETED';

              return (
                <div
                  key={c.id}
                  className={`flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 group relative ${
                    isLocked
                      ? 'bg-slate-950/50 border border-slate-800/60 opacity-65 hover:opacity-75'
                      : isCompleted
                      ? 'bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/20 hover:-translate-y-1'
                      : isCurrent
                      ? 'bg-slate-900/90 border border-cyan-500/60 shadow-lg shadow-cyan-950/30 hover:-translate-y-1'
                      : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-cyan-950/40 hover:-translate-y-1'
                  }`}
                >
                  {/* Active / Completed Floating Badges */}
                  {isCurrent && !isCompleted && (
                    <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-md shadow-cyan-500/40">
                      ACTIVE SESSION
                    </div>
                  )}

                  {isCompleted && (
                    <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-md shadow-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> COMPLETED ✓
                    </div>
                  )}

                  {/* Card Content Top */}
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase border ${getDifficultyBadge(
                            c.difficulty
                          )}`}
                        >
                          {c.difficulty}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 font-medium">
                          {c.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          {c.points} PTS
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          {durationMin}m
                        </span>
                      </div>
                    </div>

                    {/* Challenge Title */}
                    <div>
                      <h2
                        className={`text-base font-bold transition-colors line-clamp-1 ${
                          isLocked
                            ? 'text-slate-400'
                            : isCompleted
                            ? 'text-emerald-300'
                            : 'text-white group-hover:text-cyan-300'
                        }`}
                      >
                        {c.title}
                      </h2>
                      <p className="text-xs text-slate-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>

                      {/* Locked Reason Note */}
                      {isLocked && (
                        <div className="p-2.5 mt-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{c.lockedReason || 'Complete previous tier to unlock.'}</span>
                        </div>
                      )}
                    </div>

                    {/* Specifications: Tasks & Blocks */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                          <Code2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase block">Quiz Tasks</span>
                          <span className="font-bold text-slate-200">{c.tasksCount} Tasks</span>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] uppercase block">Code Blocks</span>
                          <span className="font-bold text-slate-200">{c.blocksCount} Blocks</span>
                        </div>
                      </div>
                    </div>

                    {/* Languages Supported */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                        Supported Compilers
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.supportedLanguages?.map((langKey) => {
                          const info = LANGUAGE_LABELS[langKey] || { name: langKey, icon: '💻' };
                          return (
                            <span
                              key={langKey}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1 font-sans"
                            >
                              <span>{info.icon}</span> {info.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-6 mt-4 border-t border-slate-800/80">
                    {isLocked ? (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-xl font-mono font-bold text-xs tracking-wider bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-slate-500" />
                        <span>[ LOCKED ]</span>
                      </button>
                    ) : isCompleted ? (
                      <button
                        onClick={() => handleSolve(c)}
                        className="w-full py-3 px-4 rounded-xl font-mono font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/30"
                      >
                        <RotateCcw className="w-4 h-4 text-emerald-400" />
                        <span>[ PLAY AGAIN ]</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSolve(c)}
                        className={`w-full py-3 px-4 rounded-xl font-mono font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                          isCurrent
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/30'
                            : 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:via-cyan-400 hover:to-teal-300 text-slate-950 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 group-hover:scale-[1.02]'
                        }`}
                      >
                        <span>{isCurrent ? '[ RESUME ARENA ]' : '[ SOLVE CHALLENGE ]'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Toast */}
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
      </div>
    </div>
  );
}
