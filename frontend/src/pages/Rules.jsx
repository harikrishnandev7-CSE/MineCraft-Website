import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import { ShieldAlert, Clock, CheckCircle, Layers } from 'lucide-react';

export default function Rules() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    if (!agreed) return;
    navigate('/challenges');
  };

  const rulesList = [
    'Strict Linear Track: Complete Easy to unlock Medium, then Medium to unlock Hard. Challenges cannot be skipped or chosen.',
    'Single round timed challenge — 20:00 countdown starts immediately upon entering a challenge arena',
    'AI tools are strictly prohibited',
    'Internet lookups and external assistance are strictly prohibited',
    'Solve progressive quizzes to earn keys and unlock code fragments',
    'Each correct quiz answer unlocks one code block fragment',
    'Wrong quiz answers add a 20-second time penalty to your official tournament time',
    'After a wrong answer, a 3-second cooldown applies before the next attempt',
    'Collect all fragments, then arrange them in the correct execution order on the assembly board',
    'Run assembled code against sample tests, then submit for hidden test-case scoring',
    'ACCEPTED result commits your official time and points. Replay is locked after acceptance to protect leaderboard integrity.',
    'If your session expires without acceptance, you can RETRY your current challenge until solved.',
    'Leaderboard rank is determined by total score, then lowest total time + penalties.',
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 font-mono">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>OFFICIAL EVENT REGULATIONS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          MIND CRAFT – Quiz Hunt & Code Assembly
        </h1>
        <p className="text-xs text-slate-400">
          Review the competition mechanics before entering the mission track
        </p>
      </div>

      {/* HOW PROGRESSION WORKS */}
      <div className="p-5 bg-slate-900/60 border border-cyan-500/20 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" /> Linear Mission Progression
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          Participants do not select challenges arbitrarily. You must progress through the canonical 3-tier sequence:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <span className="font-bold text-emerald-400 block">1. Easy (ch-05)</span>
            <span className="text-[11px] text-slate-400">Available immediately. 100 PTS.</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30">
            <span className="font-bold text-amber-400 block">2. Medium (ch-06)</span>
            <span className="text-[11px] text-slate-400">Unlocks once Easy is ACCEPTED. 200 PTS.</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30">
            <span className="font-bold text-rose-400 block">3. Hard (ch-07)</span>
            <span className="text-[11px] text-slate-400">Unlocks once Medium is ACCEPTED. 300 PTS.</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Gameplay Flow</h3>
        <ol className="space-y-2 text-xs text-slate-300 list-none">
          {[
            '1. Select your preferred programming language (Python / C / C++ / Java)',
            '2. Answer progressive programming tasks to unlock code fragments',
            '3. Correct answer → code fragment unlocked into your fragment vault',
            '4. Wrong answer → +20s penalty → 3s cooldown → alternate question appears',
            '5. Collect all fragments, then assemble them in the correct execution order',
            '6. Click "Run Code" to test against sample input, then "Submit" for hidden tests',
            '7. ACCEPTED = advance to next challenge in sequence + commit leaderboard score',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* RULES LIST */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" /> Tournament Rules
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-300">
          {rulesList.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="text-cyan-400 font-bold">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AGREEMENT */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-5">
        <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
          />
          <span>I have read and agree to all rules, linear unlock constraints, and timing protocols</span>
        </label>

        <Button
          variant="primary"
          size="lg"
          disabled={!agreed}
          onClick={handleStart}
          className="w-full text-sm font-black"
        >
          ENTER MISSION ROADMAP
        </Button>
      </div>
    </div>
  );
}
