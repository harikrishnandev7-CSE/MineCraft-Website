import React from 'react';
import { Link } from 'react-router-dom';

export default function Result() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-4xl">
        🎉
      </div>
      <h1 className="text-3xl font-black text-white">Challenge Completed!</h1>
      <p className="text-slate-400 text-sm max-w-md mx-auto">
        Your submission passed all judge test cases. Points have been credited to your leaderboard tally.
      </p>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-3 gap-4 text-center">
        <div>
          <span className="text-xs text-slate-500 uppercase font-mono">Score</span>
          <p className="text-xl font-bold text-cyan-400">+150</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-mono">Time Taken</span>
          <p className="text-xl font-bold text-white font-mono">14m 22s</p>
        </div>
        <div>
          <span className="text-xs text-slate-500 uppercase font-mono">Tests Passed</span>
          <p className="text-xl font-bold text-emerald-400">10 / 10</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <Link
          to="/leaderboard"
          className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-sm transition"
        >
          View Leaderboard
        </Link>
        <Link
          to="/challenge"
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-sm border border-slate-700 transition"
        >
          Next Challenge
        </Link>
      </div>
    </div>
  );
}
