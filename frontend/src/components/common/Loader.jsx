import React from 'react';

export default function Loader({ message = 'Loading...', size = 'md' }) {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className={`animate-spin rounded-full border-orange-500/20 border-t-orange-400 ${sizeMap[size] || sizeMap.md}`} />
      {message && <p className="text-xs font-mono font-medium text-slate-600 tracking-wider">{message}</p>}
    </div>
  );
}
