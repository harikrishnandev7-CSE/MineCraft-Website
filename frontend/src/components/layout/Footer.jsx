import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 mt-auto text-center text-xs text-slate-500 font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 MIND CRAFT. QR Hunt & Code Assembly Platform.</p>
        <p className="text-[11px] text-slate-600">Frontend Prototype // Zero Backend Dependency</p>
      </div>
    </footer>
  );
}
