import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const bgStyles = {
    info: 'bg-cyan-950 border-cyan-500 text-cyan-200',
    success: 'bg-emerald-950 border-emerald-500 text-emerald-200',
    error: 'bg-rose-950 border-rose-500 text-rose-200',
    warning: 'bg-amber-950 border-amber-500 text-amber-200',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgStyles[type] || bgStyles.info}`}>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}
