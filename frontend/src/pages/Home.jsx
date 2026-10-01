import React from 'react';
import { Link } from 'react-router-dom';
import { useParticipant } from '../context/ParticipantContext';
import { QrCode, Blocks, Bug, Play, Clock, Trophy, ArrowRight, Sparkles } from 'lucide-react';

export default function Home() {
  const { participant } = useParticipant();

  const features = [
    { title: "QR Hunt", desc: "Discover 8 encrypted digital tokens distributed throughout the challenge matrix.", icon: QrCode, color: "text-cyan-400" },
    { title: "Code Assembly", desc: "Drag and drop unlocked logic fragments into correct syntactic sequence.", icon: Blocks, color: "text-emerald-400" },
    { title: "Debugging", desc: "Identify and discard deceptive trap blocks that cause runtime errors.", icon: Bug, color: "text-amber-400" },
    { title: "Online Execution", desc: "Simulate real-time compilation across Python, C, C++, and Java.", icon: Play, color: "text-blue-400" },
    { title: "Timed Challenge", desc: "Test your wits against a relentless 20-minute live countdown timer.", icon: Clock, color: "text-purple-400" },
    { title: "Leaderboard", desc: "Compete for top podium position based on speed and test case accuracy.", icon: Trophy, color: "text-rose-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
      {/* HERO SECTION */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider shadow-lg shadow-cyan-950/50">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>ANNUAL TECHNICAL HACKATHON // ARENA 2026</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-mono">
          MIND CRAFT
          <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-300">
            QR Hunt & Code Assembly
          </span>
        </h1>

        <p className="text-xs sm:text-sm font-mono text-cyan-300 uppercase tracking-widest font-semibold">
          Think. Decode. Assemble. Debug. Execute.
        </p>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Decode hidden code blocks, assemble the program, run it, and complete the challenge before time runs out.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={participant ? "/challenge" : "/register"}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 hover:from-blue-500 hover:via-cyan-400 hover:to-emerald-300 text-slate-950 font-mono font-black text-sm tracking-wider shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            [ ENTER CHALLENGE ] <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/rules"
            className="px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-mono text-xs font-bold border border-slate-700 transition"
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
              <h3 className="text-base font-bold text-slate-100 font-mono">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* ARCHITECTURE SUMMARY */}
      <div className="p-8 bg-slate-900/40 border border-slate-800/80 rounded-2xl text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-sm font-bold font-mono text-slate-300 uppercase tracking-widest">
          HOW THE ARENA OPERATES
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-slate-400">
          <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">1. Digital QR Hunt</span>
          <span>→</span>
          <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">2. Token Decryption</span>
          <span>→</span>
          <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">3. Logic Assembly</span>
          <span>→</span>
          <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">4. Mock Execution</span>
          <span>→</span>
          <span className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">5. Hidden Test Scoring</span>
        </div>
      </div>
    </div>
  );
}
