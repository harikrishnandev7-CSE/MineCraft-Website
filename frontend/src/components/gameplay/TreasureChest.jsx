import React, { useState } from 'react';
import { Package, Key, Package2, ChevronRight } from 'lucide-react';

/**
 * TreasureChest — represents one chest in the HUNT phase.
 *
 * status: 'locked' | 'active' | 'key-earned' | 'opened'
 */
export default function TreasureChest({
  chest,
  chestState,
  fragmentSnippet,   // first line of the revealed fragment (shown after open)
  isActive,
  onClick,
  index,
}) {
  const [justOpened, setJustOpened] = useState(false);
  const status = chestState?.status || 'locked';
  const keyEarned = chestState?.keyEarned || false;

  const handleClick = () => {
    if (status === 'opened') return;
    onClick?.();
    if (status === 'key-earned') setJustOpened(true);
  };

  // ── visual config per status ──
  const cfg = {
    locked: {
      border: 'border-slate-800 hover:border-slate-600',
      bg: 'bg-slate-950/60',
      icon: '🔒',
      label: 'Locked',
      labelColor: 'text-slate-500',
    },
    active: {
      border: 'border-cyan-500/50 animate-chestReady',
      bg: 'bg-cyan-950/20',
      icon: '✨',
      label: 'Active',
      labelColor: 'text-cyan-400',
    },
    'key-earned': {
      border: 'border-yellow-500/60 animate-keyGlow',
      bg: 'bg-yellow-950/20',
      icon: '🔑',
      label: 'Open!',
      labelColor: 'text-yellow-300',
    },
    opened: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/10',
      icon: '📦',
      label: 'Opened',
      labelColor: 'text-emerald-400',
    },
  };

  const c = cfg[status] || cfg.locked;

  return (
    <button
      onClick={handleClick}
      disabled={status === 'opened'}
      aria-label={`Chest ${index + 1}: ${c.label}${status === 'opened' && fragmentSnippet ? ` – contains: ${fragmentSnippet}` : ''}`}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all cursor-pointer select-none
        ${c.border} ${c.bg}
        ${status === 'opened' ? 'opacity-80 cursor-default' : 'hover:scale-105 active:scale-95'}
        ${isActive && status !== 'opened' ? 'ring-1 ring-cyan-500/40' : ''}
      `}
    >
      {/* chest number badge */}
      <span className="absolute -top-2 -left-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-full w-5 h-5 flex items-center justify-center">
        {index + 1}
      </span>

      {/* icon */}
      <span className={`text-2xl leading-none ${justOpened ? 'animate-phaseBurst' : ''}`}>
        {c.icon}
      </span>

      {/* label */}
      <span className={`text-[10px] font-mono font-bold uppercase ${c.labelColor}`}>
        {c.label}
      </span>

      {/* fragment chip (opened state) */}
      {status === 'opened' && fragmentSnippet && (
        <span className="text-[9px] font-mono text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/40 max-w-[80px] truncate">
          {fragmentSnippet}
        </span>
      )}
    </button>
  );
}
