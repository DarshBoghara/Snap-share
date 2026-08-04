import React from 'react';

export const Avatar = ({ username, image, isOnline, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const badgeSizeClasses = {
    sm: 'w-2.5 h-2.5 right-0 bottom-0',
    md: 'w-3 h-3 right-0 bottom-0',
    lg: 'w-3.5 h-3.5 right-0.5 bottom-0.5',
    xl: 'w-4 h-4 right-1 bottom-1',
  };

  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div className="relative inline-block flex-shrink-0">
      {image ? (
        <img
          src={image}
          alt={username}
          className={`${sizeClasses[size]} rounded-full object-cover border border-slate-700 dark:border-slate-700 light:border-slate-300 shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-inner border border-white/20`}
        >
          {initial}
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute ${badgeSizeClasses[size]} rounded-full border-2 border-slate-900 dark:border-slate-900 light:border-white ${
            isOnline ? 'bg-emerald-500 shadow-sm' : 'bg-slate-400'
          }`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};
