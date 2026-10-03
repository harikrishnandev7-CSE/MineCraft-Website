import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import { challengeApi } from '../services/challengeApi';
import { KeyRound, Puzzle, Play, Clock, Trophy, ArrowRight, Sparkles, Package, Layers } from 'lucide-react';

export default function Home() {
  const { participant } = useParticipant();
  const [currentChallengeSlug, setCurrentChallengeSlug] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function checkProgress() {
      if (!participant) return;
      try {
        const res = await challengeApi.getProgress();
        if (!cancelled && res.success && res.currentChallengeSlug) {
          setCurrentChallengeSlug(res.currentChallengeSlug);
        }
      } catch (_) {}
    }
    checkProgress();
    return () => { cancelled = true; };
  }, [participant]);

  const targetUrl = participant && currentChallengeSlug
    ? `/challenge?id=${currentChallengeSlug}`
    : '/challenges';

  const features = [
    {
      title: 'Linear Progression',
      desc: 'Complete Easy to unlock Medium, then Medium to unlock Hard. Challenges cannot be skipped or chosen freely.',
      icon: Layers,
      color: 'text-cyan-400',
    },
    {
      title: 'Quiz → Key',
      desc: 'Solve programming quizzes (MCQ, predict output, fill-in-the-blank) to earn keys that unlock treasure chests.',
      icon: KeyRound,
      color: 'text-blue-400',
    },
    {
      title: 'Treasure Chests',
      desc: 'Each key opens a chest that reveals one code fragment — collected in a deliberately shuffled order.',
      icon: Package,
      color: 'text-amber-400',
    },
    {
      title: 'Fragment Assembly',
      desc: 'Once all fragments are collected, arrange them in the correct logical order on the assembly board.',
      icon: Puzzle,
      color: 'text-emerald-400',
    },
    {
      title: 'Real Execution',
      desc: 'Run your assembled code against sample input via Judge0, then submit for hidden test-case scoring.',
      icon: Play,
      color: 'text-purple-400',
    },
    {
      title: 'Timed Competition',
      desc: 'Beat the 20-minute countdown per challenge. Fastest total solution time + penalties wins.',
      icon: Trophy,
      color: 'text-rose-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-20 font-mono">
      {/* HERO */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs tracking-wider shadow-lg shadow-cyan-950/50">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>ANNUAL TECHNICAL HACKATHON // ARENA 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white">
          MIND CRAFT
          <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-300">
            Quiz Hunt & Code Assembly
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-cyan-300 uppercase tracking-widest font-semibold">
          Easy → Medium → Hard // Think. Quiz. Unlock. Assemble. Execute.
        </p>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-sans">
          Route through a strict linear sequence: complete Easy to unlock Medium, then solve Medium to unlock Hard.
          Solve quizzes to earn keys, unlock fragments, assemble the code, and clear all test cases before time runs out.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={targetUrl}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 hover:from-blue-500 hover:via-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            [ ENTER CHALLENGE ] <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/rules"
            className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition"
          >
            READ RULES & PROTOCOL
          </Link>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition duration-200 group hover:shadow-xl hover:shadow-cyan-950/20"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-base font-bold text-slate-100">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* LINEAR TRACK INFO */}
      <div className="p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
          3-TIER LINEAR MISSION PATH
        </h3>
        <p className="text-xs text-slate-400 font-sans max-w-lg mx-auto">
          Complete Easy to unlock Medium, then Medium to unlock Hard. Challenges cannot be skipped or chosen.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 pt-2">
          <span className="px-3.5 py-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold rounded-lg">
            1. Easy (100 PTS)
          </span>
          <span className="text-slate-600 font-black">→</span>
          <span className="px-3.5 py-1.5 bg-amber-950/60 border border-amber-500/40 text-amber-400 font-bold rounded-lg">
            2. Medium (200 PTS)
          </span>
          <span className="text-slate-600 font-black">→</span>
          <span className="px-3.5 py-1.5 bg-rose-950/60 border border-rose-500/40 text-rose-400 font-bold rounded-lg">
            3. Hard (300 PTS)
          </span>
        </div>
      </div>
    </div>
  );
}
