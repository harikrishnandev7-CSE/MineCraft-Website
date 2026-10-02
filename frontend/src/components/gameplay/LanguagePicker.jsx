import React from 'react';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

/**
 * LanguagePicker — shown in SETUP phase before hunt starts.
 * Locks and shows as a badge once languageLocked = true.
 */
export default function LanguagePicker({ language, onSelect, locked = false }) {
  if (locked) {
    const lang = SUPPORTED_LANGUAGES.find((l) => l.id === language);
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono">
        <span>{lang?.icon || '💻'}</span>
        <span className="font-bold text-cyan-300">{lang?.name || language.toUpperCase()}</span>
        <span className="text-slate-500 text-[10px] ml-1">(locked)</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
        Choose Language
      </label>
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onSelect(lang.id)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              language === lang.id
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-inner shadow-cyan-950/30'
                : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
            aria-pressed={language === lang.id}
          >
            <span className="text-base">{lang.icon}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
