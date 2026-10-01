import React from 'react';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

export default function ChallengeLanguageSelector({ selectedLanguage, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 uppercase font-semibold">Language:</span>
      <select
        value={selectedLanguage}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-400 font-mono"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
