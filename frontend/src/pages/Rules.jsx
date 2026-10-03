import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallenge } from '../hooks/useChallenge';
import Button from '../components/common/Button';
import { ShieldAlert, Clock, CheckCircle } from 'lucide-react';

export default function Rules() {
  const [agreed, setAgreed] = useState(false);
  const { startChallenge } = useChallenge();
  const navigate = useNavigate();

  const handleStart = () => {
    if (!agreed) return;
    navigate('/challenges');
  };

  const rulesList = [
    'Single round timed challenge — 20:00 countdown starts immediately upon entry',
    'AI tools are strictly prohibited',
    'Internet lookups are prohibited',
    'External assistance is prohibited',
    'Solve quizzes to earn keys and unlock treasure chests',
    'Each correct quiz answer earns a key to open one chest',
    'Wrong quiz answers add a 20-second time penalty to your ranking time',
    'After a wrong answer, a 3-second cooldown applies before the next question',
    'Collect all code fragments from opened chests',
    'Arrange fragments in the correct execution order on the assembly board',
    'Run the assembled code against sample input to verify output',
    'Submit for hidden test-case scoring — all tests must pass for ACCEPTED',
    'Fastest correct completion (time + penalties) determines your leaderboard rank',
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
          Review the competition mechanics before initializing the clock
        </p>
      </div>

      {/* HOW IT WORKS */}
      <div className="p-5 bg-slate-900/60 border border-cyan-500/20 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">How It Works</h3>
        <ol className="space-y-2 text-xs text-slate-300 list-none">
          {[
            '1. Choose your programming language (Python / C / C++ / Java)',
            '2. Click a treasure chest to start a quiz about that language and problem',
            '3. Answer correctly → earn a key → click "Open Chest" to reveal a code fragment',
            '4. Wrong answer → +20s time penalty → 3s cooldown → different question appears',
            '5. Repeat until all fragments are collected — then assemble them in order',
            '6. Use ▲▼ buttons or drag-and-drop to arrange fragments',
            '7. Click "Run Code" to test against sample input, then "Submit" for hidden tests',
            '8. ACCEPTED = all hidden tests pass → your result is committed to the leaderboard',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-500 mt-0.5 flex-shrink-0" />
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

      {/* DURATION BADGE */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
            Challenge Duration
          </span>
          <span className="text-3xl font-black text-white font-mono tracking-wider">20:00</span>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>Countdown starts immediately upon entry</p>
          <p className="text-rose-400 mt-1">Wrong quiz answers add +20s each</p>
        </div>
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
          <span>I have read and understood all rules and mechanics</span>
        </label>

        <Button
          variant="primary"
          size="lg"
          disabled={!agreed}
          onClick={handleStart}
          className="w-full text-sm font-black"
        >
          CHOOSE CHALLENGE
        </Button>
      </div>
    </div>
  );
}
