import React from 'react';

export const TypingIndicator = ({ username }) => {
  return (
    <div className="flex items-center space-x-2 py-2 px-3 bg-slate-800 text-slate-100 dark:bg-slate-800 dark:text-slate-100 light:bg-white light:text-slate-900 rounded-2xl rounded-bl-none border border-slate-700 dark:border-slate-700 light:border-slate-200 w-fit shadow-sm animate-fade-in">
      <span className="text-xs font-medium text-slate-400 dark:text-slate-400 light:text-slate-600">{username || 'User'} is typing</span>
      <div className="flex items-center space-x-1">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
      </div>
    </div>
  );
};
