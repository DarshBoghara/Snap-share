import React from 'react';
import { MessageSquare, Search, WifiOff, Users, Flame } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  type = 'no-chat',
  title,
  description,
  actionLabel,
  onAction
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'no-messages':
        return <MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
      case 'no-users':
        return <Users className="w-10 h-10 text-slate-400" />;
      case 'search-empty':
        return <Search className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
      case 'offline':
        return <WifiOff className="w-10 h-10 text-rose-500" />;
      case 'no-chat':
      default:
        return <Flame className="w-10 h-10 text-blue-600 dark:text-blue-400" />;
    }
  };

  const defaults = {
    'no-chat': {
      title: 'Select a conversation',
      description: 'Choose a contact from the sidebar or search for a user to start sending disappearing messages.'
    },
    'no-messages': {
      title: 'No messages yet',
      description: 'Send a message below to start a private disappearing conversation.'
    },
    'no-users': {
      title: 'No contacts found',
      description: 'Try searching with a different username or email address.'
    },
    'search-empty': {
      title: 'No search results',
      description: 'We couldn\'t find any user matching your search query.'
    },
    'offline': {
      title: 'Connection lost',
      description: 'You appear to be offline. Reconnecting to real-time server...'
    }
  };

  const activeTitle = title || defaults[type]?.title || 'No data';
  const activeDesc = description || defaults[type]?.description || '';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
        {renderIcon()}
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {activeTitle}
        </h3>
        {activeDesc && (
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {activeDesc}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md" className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
