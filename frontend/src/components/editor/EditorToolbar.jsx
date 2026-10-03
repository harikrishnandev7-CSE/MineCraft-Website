import React from 'react';
import LanguageSelector from './LanguageSelector';
import { Terminal } from 'lucide-react';

export default function EditorToolbar({ language, onLanguageChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-t-2xl">
      <div className="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold">
        <Terminal className="w-4 h-4" />
        <span>VIRTUAL CODE RUNNER</span>
      </div>
      <LanguageSelector selectedLanguage={language} onChange={onLanguageChange} />
    </div>
  );
}
