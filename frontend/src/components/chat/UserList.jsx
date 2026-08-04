import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Flame, Command } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

export const UserList = ({
  users,
  activeUserId,
  onSelectUser,
  onSearch,
  unreadCounts = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
    searchInputRef.current?.focus();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-200">
      {/* Sidebar Header & Search Bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 flex-shrink-0 bg-white dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            Chats <Flame className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-600/20" />
          </h2>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
            {users.length} Contacts
          </span>
        </div>

        {/* Animated Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search users... (Ctrl+K)"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full text-sm rounded-xl pl-9 pr-8 py-2 border transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500"
          />
          {searchQuery ? (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 absolute right-2.5 top-2 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* User Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-900">
        {users.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No users found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Type a username to start a conversation</p>
          </div>
        ) : (
          users.map((u) => {
            const isActive = activeUserId === u.id;
            const unread = unreadCounts[u.id] || 0;

            return (
              <button
                key={u.id}
                onClick={() => onSelectUser(u)}
                className={`w-full p-3.5 flex items-center space-x-3.5 text-left transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-900 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600 dark:border-blue-500 font-medium'
                    : ''
                }`}
              >
                <Avatar username={u.username} image={u.profile_image} isOnline={u.is_online} size="lg" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{u.username}</h3>
                    {unread > 0 && (
                      <Badge variant="accent" className="animate-pulse">
                        {unread}
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs truncate flex items-center gap-1">
                    {u.is_online ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">Offline</span>
                    )}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
