import React from 'react';

export default function Rules() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Tournament Rules & Mechanics</h1>
        <p className="text-sm text-slate-400 mt-1">Official guidelines for Mind Craft participants</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300">
        <section className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h2 className="text-base font-bold text-cyan-400">1. Physical Code Discovery</h2>
          <p className="leading-relaxed">
            QR codes are hidden or stationed across physical checkpoints in the event area. Each QR code represents an individual code block (fragment) of a target challenge program.
          </p>
        </section>

        <section className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h2 className="text-base font-bold text-cyan-400">2. Code Assembly & Synthesis</h2>
          <p className="leading-relaxed">
            Once scanned, blocks are unlocked in your digital workbench. You must arrange the fragments in proper execution order. Missing blocks must be found before full testing or manual reconstruction can be attempted.
          </p>
        </section>

        <section className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h2 className="text-base font-bold text-cyan-400">3. Scoring & Tiebreakers</h2>
          <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
            <li><strong>Points:</strong> Awarded for passing all automated test suites on Judge0.</li>
            <li><strong>Time Penalty:</strong> Elapsed time from session start to successful submission.</li>
            <li><strong>Penalty Minutes:</strong> 5-minute penalty applied for each failed submission before accepted run.</li>
          </ul>
        </section>

        <section className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <h2 className="text-base font-bold text-rose-400">4. Fair Play & Integrity</h2>
          <p className="leading-relaxed">
            Tampering with physical QR tags, sharing tokens across non-team members, or network interference will result in immediate disqualification.
          </p>
        </section>
      </div>
    </div>
  );
}
