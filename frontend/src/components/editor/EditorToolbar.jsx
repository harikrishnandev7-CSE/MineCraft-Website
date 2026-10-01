import React from 'react';
import LanguageSelector from './LanguageSelector';

export default function EditorToolbar({ language, onLanguageChange, onFormat, onReset }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-t-xl">
      <LanguageSelector selectedLanguage={language} onChange={onLanguageChange} />
      <div className="flex items-center gap-2">
        {onFormat && (
          <button
            onClick={onFormat}
            className="text-xs px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition"
          >
            Format
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs px-2.5 py-1 text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900 rounded transition"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
