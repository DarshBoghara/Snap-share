import React from 'react';

export const Badge = ({ children, variant = 'accent', className = '' }) => {
  const variants = {
    accent: 'bg-blue-600 text-white',
    secondary: 'bg-slate-700 text-slate-200 dark:bg-slate-700 dark:text-slate-200 light:bg-slate-200 light:text-slate-800',
    success: 'bg-emerald-500/20 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30',
    danger: 'bg-rose-500/20 text-rose-400 dark:text-rose-400 light:text-rose-700 border border-rose-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
