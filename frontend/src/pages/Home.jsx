import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Live Physical-Digital Competitive Hackathon
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto">
          Scan QR Codes. Assemble Logic. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-200">
            Conquer the Arena.
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Mind Craft blends physical world puzzle hunting with algorithmic assembly. Discover distributed QR codes, decode functional code fragments, arrange them on the canvas, and compile your solution.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/challenge"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition shadow-lg hover:shadow-cyan-500/20"
          >
            Enter Challenge Arena
          </Link>
          <Link
            to="/rules"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition"
          >
            Read Rules & Guide
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-xl">
            📷
          </div>
          <h3 className="text-lg font-bold text-white">1. QR Discovery</h3>
          <p className="text-sm text-slate-400">
            Scout physical checkpoints across the venue. Scan unique encrypted QR codes to unlock fragmented code blocks.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
            🧩
          </div>
          <h3 className="text-lg font-bold text-white">2. Drag & Assemble</h3>
          <p className="text-sm text-slate-400">
            Use the interactive assembly canvas to organize imports, function calls, and control structures into valid code.
          </p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xl">
            ⚡
          </div>
          <h3 className="text-lg font-bold text-white">3. Judge0 Execution</h3>
          <p className="text-sm text-slate-400">
            Edit and run your program against automated sandboxed test suites with instant feedback on correctness and speed.
          </p>
        </div>
      </div>
    </div>
  );
}
