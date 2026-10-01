import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  icon: Icon,
  ...props
}) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

  const variants = {
    primary: "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:via-cyan-400 hover:to-teal-300 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 focus:ring-cyan-400",
    secondary: "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 shadow-sm focus:ring-slate-500",
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 focus:ring-emerald-400",
    danger: "bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/20 focus:ring-rose-500",
    ghost: "bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white focus:ring-slate-600",
    cyber: "bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-mono shadow-md shadow-cyan-500/10 focus:ring-cyan-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
}
