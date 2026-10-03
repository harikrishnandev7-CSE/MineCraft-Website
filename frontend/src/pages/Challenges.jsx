import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useChallenge } from '../hooks/useChallenge';
import { useParticipant } from '../context/ParticipantContext';
import { challengeApi } from '../services/challengeApi';
import { CHALLENGES as STATIC_CHALLENGES } from '../data/challenges';
import {
  Search,
  Trophy,
  Clock,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
  Code2,
  Filter,
  UserCheck,
  Shield,
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
  const { participant } = useParticipant();
  const { challenge: activeChallenge, selectChallenge } = useChallenge();

  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [needRegisterAlert, setNeedRegisterAlert] = useState(false);

  // ── Load challenges from API + static fallback ──
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const res = await challengeApi.getAll();
        if (cancelled) return;

        let serverList = [];
        if (res && res.success && Array.isArray(res.challenges)) {
          serverList = res.challenges;
        }

        // Map server challenges into a uniform structure
        const mappedServer = serverList.map((sc) => {
          const matchingStatic = STATIC_CHALLENGES.find(
            (st) => st.id === sc.slug || st.slug === sc.slug || st.title === sc.title
          );

          const langs = sc.languageConfigs && sc.languageConfigs.length > 0
            ? sc.languageConfigs.map((lc) => lc.language)
            : matchingStatic?.languages
            ? Object.keys(matchingStatic.languages)
            : ['python', 'java', 'cpp', 'c'];

          const tasksCount = Array.isArray(sc.tasks) && sc.tasks.length > 0
            ? sc.tasks.length
            : matchingStatic?.languages?.python?.chests?.length || 4;

          const blocksCount = sc.languageConfigs?.[0]?.blockCount
            || matchingStatic?.languages?.python?.fragments?.length
            || tasksCount;

          return {
            id: sc.slug || sc._id,
            slug: sc.slug || sc._id,
            title: sc.title,
            description: sc.description || matchingStatic?.description || '',
            category: sc.category || matchingStatic?.category || 'Algorithms',
            difficulty: sc.difficulty || matchingStatic?.difficulty || 'Medium',
            points: sc.points ?? matchingStatic?.points ?? 100,
            duration: sc.timeLimitSeconds || matchingStatic?.duration || 1200,
            tasksCount,
            blocksCount,
            supportedLanguages: langs,
            isBackend: true,
          };
        });

        // Also add any static challenges not present in backend
        const remainingStatic = STATIC_CHALLENGES.filter(
          (st) => !mappedServer.some((ms) => ms.slug === st.id || ms.id === st.id)
        ).map((st) => {
          const langs = st.languages ? Object.keys(st.languages) : ['python', 'java', 'cpp', 'c'];
          const tasksCount = st.languages?.python?.chests?.length || 4;
          const blocksCount = st.languages?.python?.fragments?.length || tasksCount;

          return {
            id: st.id,
            slug: st.id,
            title: st.title,
            description: st.description || '',
            category: st.category || 'Algorithms',
            difficulty: st.difficulty || 'Medium',
            points: st.points || 100,
            duration: st.duration || 1200,
            tasksCount,
            blocksCount,
            supportedLanguages: langs,
            isBackend: false,
          };
        });

        const combined = [...mappedServer, ...remainingStatic];
        setChallenges(combined);
      } catch (err) {
        console.warn('Failed to load challenges from API, falling back to static:', err);
        // Fallback to static challenges
        const fallback = STATIC_CHALLENGES.map((st) => ({
          id: st.id,
          slug: st.id,
          title: st.title,
          description: st.description || '',
          category: st.category || 'Algorithms',
          difficulty: st.difficulty || 'Medium',
          points: st.points || 100,
          duration: st.duration || 1200,
          tasksCount: st.languages?.python?.chests?.length || 4,
          blocksCount: st.languages?.python?.fragments?.length || 4,
          supportedLanguages: st.languages ? Object.keys(st.languages) : ['python', 'java', 'cpp', 'c'],
          isBackend: false,
        }));
        if (!cancelled) setChallenges(fallback);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Available Categories ──
  const categories = useMemo(() => {
    const set = new Set();
    challenges.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [challenges]);

  // ── Filtered Challenges ──
  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDiff =
        difficultyFilter === 'ALL' ||
        c.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      const matchesCat =
        categoryFilter === 'ALL' || c.category === categoryFilter;

      return matchesSearch && matchesDiff && matchesCat;
    });
  }, [challenges, searchTerm, difficultyFilter, categoryFilter]);

  // ── Stats ──
  const totalPoints = useMemo(() => {
    return challenges.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
  }, [challenges]);

  // ── Handler: Solve Challenge ──
  const handleSolve = (challenge) => {
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
                Select an active coding trial to enter the arena. Solve progressive quizzes to unlock 
                code blocks one-by-one, reconstruct the correct logical order, and execute the solution against hidden test cases.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap sm:flex-col gap-3 min-w-[200px]">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Active Trials
                </span>
                <span className="text-base font-black text-white">{challenges.length}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Total Points
                </span>
                <span className="text-base font-black text-amber-400">{totalPoints} PTS</span>
              </div>
            </div>
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

        {/* ── SEARCH & FILTER CONTROLS ── */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search challenges by title, topic, or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Difficulty Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  difficultyFilter === diff
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── CHALLENGE CARDS GRID ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl animate-pulse space-y-4 h-72"
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
        ) : filteredChallenges.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-4">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-300">No Challenges Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No challenge matches your current search or filters. Try searching for a different keyword or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setDifficultyFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((c) => {
              const isCurrent = activeChallenge && (activeChallenge.id === c.id || activeChallenge.slug === c.slug);
              const durationMin = Math.round(c.duration / 60);

              return (
                <div
                  key={c.id}
                  className={`flex flex-col justify-between p-6 bg-slate-900/70 border rounded-2xl transition-all duration-300 group hover:shadow-2xl hover:shadow-cyan-950/40 hover:-translate-y-1 relative ${
                    isCurrent
                      ? 'border-cyan-500/60 bg-slate-900/90 shadow-lg shadow-cyan-950/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Current Active Badge Indicator */}
                  {isCurrent && (
                    <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-md shadow-cyan-500/40">
                      ACTIVE SESSION
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
                      <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {c.title}
                      </h2>
                      <p className="text-xs text-slate-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
