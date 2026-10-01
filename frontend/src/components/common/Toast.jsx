import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const config = {
    info: { bg: 'bg-slate-900/95 border-cyan-500/50 text-cyan-200 shadow-cyan-950/50', icon: Info },
    success: { bg: 'bg-slate-900/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50', icon: CheckCircle2 },
    error: { bg: 'bg-slate-900/95 border-rose-500/50 text-rose-200 shadow-rose-950/50', icon: AlertCircle },
    warning: { bg: 'bg-slate-900/95 border-amber-500/50 text-amber-200 shadow-amber-950/50', icon: AlertTriangle },
  };

  const current = config[type] || config.info;
  const Icon = current.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-slideUp ${current.bg}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-xs font-mono font-medium leading-relaxed">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
