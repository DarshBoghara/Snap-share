import React from 'react';
import { Check, CheckCheck, Flame } from 'lucide-react';
import { format } from 'date-fns';

export const MessageItem = ({ message, isOwn }) => {
  const renderStatusIcon = () => {
    if (!isOwn) return null;
    switch (message.status) {
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-white/70" title="Sent" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-white/70" title="Delivered" />;
      case 'seen':
        return <CheckCheck className="w-3.5 h-3.5 text-yellow-300" title="Seen" />;
      default:
        return null;
    }
  };

  const timeFormatted = message.created_at
    ? format(new Date(message.created_at), 'HH:mm')
    : '';

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} my-2.5 transition-all duration-200`}>
      <div
        className={`relative max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm transition-all ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-none font-medium'
            : 'bg-slate-800 text-slate-100 border border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 light:bg-white light:text-slate-900 light:border-slate-200 rounded-bl-none'
        }`}
      >
        {/* Snapchat exit disappearing warning pill */}
        <div className="flex items-center gap-1 text-[10px] opacity-80 font-semibold mb-1 uppercase tracking-wider">
          <Flame className={`w-3 h-3 ${isOwn ? 'text-white' : 'text-rose-500'}`} />
          <span>Disappears when leaving chat</span>
        </div>

        <p className="break-words leading-relaxed">{message.message}</p>

        <div className={`flex items-center justify-end space-x-1.5 mt-1.5 text-[11px] ${isOwn ? 'text-white/80' : 'text-slate-400 dark:text-slate-400 light:text-slate-500'}`}>
          <span>{timeFormatted}</span>
          {renderStatusIcon()}
        </div>
      </div>
    </div>
  );
};
