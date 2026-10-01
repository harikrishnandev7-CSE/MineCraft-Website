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
    startChallenge();
    navigate('/challenge');
  };

  const rulesList = [
    "Single round timed challenge",
    "AI tools are prohibited",
    "Internet lookups are prohibited",
    "External assistance is prohibited",
    "All code blocks must be assembled correctly",
    "The final code must execute successfully",
    "Expected output must match",
    "Fastest correct completion determines ranking",
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 font-mono">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>OFFICIAL EVENT REGULATIONS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          MIND CRAFT – QR Hunt & Code Assembly
        </h1>
        <p className="text-xs text-slate-400">
          Review the competition mechanics before initializing the clock
        </p>
      </div>

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
          <span className="text-3xl font-black text-white font-mono tracking-wider">
            20:00
          </span>
        </div>
        <div className="text-right text-xs text-slate-400">
          Countdown starts immediately upon entry
        </div>
      </div>

      {/* AGREEMENT CHECKBOX & BUTTON */}
      <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-5">
        <label className="flex items-center gap-3 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
          />
          <span>I have read and understood the rules</span>
        </label>

        <Button
          variant="primary"
          size="lg"
          disabled={!agreed}
          onClick={handleStart}
          className="w-full text-sm font-black"
        >
          START CHALLENGE
        </Button>
      </div>
    </div>
  );
}
