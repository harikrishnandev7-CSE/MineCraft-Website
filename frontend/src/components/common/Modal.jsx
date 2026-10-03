import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-white/95 border border-slate-300/80 rounded-2xl shadow-2xl shadow-cyan-950/40 w-full ${maxWidth} overflow-hidden transform transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/40">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono tracking-wide">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
