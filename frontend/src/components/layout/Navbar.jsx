import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Moon, Sun, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="w-full h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 transition-colors duration-200 shadow-sm">
      <Link to="/chat" className="flex items-center space-x-3 group">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          SnapChat <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-500/30">Ephemeral</span>
        </h1>
      </Link>

      {user && (
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Real-time Connection Status */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isConnected ? 'Real-Time Sync' : 'Reconnecting...'}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              to="/profile"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </Link>
            <Link
              to="/settings"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Current User Avatar */}
          <Link to="/profile" className="pl-2 border-l border-slate-200 dark:border-slate-800">
            <Avatar username={user.username} image={user.profile_image} isOnline={true} size="sm" />
          </Link>
        </div>
      )}
    </header>
  );
};
