import React from 'react';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

export default function LanguageSelector({ selectedLanguage, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono font-semibold text-slate-400">Language:</span>
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => onChange(lang.id)}
            className={`px-2.5 py-1 text-xs font-mono rounded-md font-semibold transition ${
              selectedLanguage === lang.id
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
