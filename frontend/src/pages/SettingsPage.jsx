import React from 'react';
import { Flame, Moon, Sun, Lock, Shield } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { useTheme } from '../hooks/useTheme';
import { Badge } from '../components/common/Badge';

export const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg transition-colors duration-250">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <div className="glass-panel p-6 sm:p-8 rounded-card border border-theme-border shadow-elevated space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-theme-primaryText flex items-center gap-2">
              Application Settings <Flame className="w-6 h-6 text-theme-accent" />
            </h2>
            <p className="text-sm text-theme-secondaryText mt-1">Manage themes, chat ephemerality rules, and privacy preferences.</p>
          </div>

          <div className="space-y-6 divide-y divide-theme-border">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-theme-primaryText flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  Appearance Theme
                </h4>
                <p className="text-xs text-theme-secondaryText">
                  Currently active: <span className="font-semibold capitalize text-theme-accent">{theme} Mode</span>
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className="w-14 h-7 rounded-full bg-theme-secondaryBg p-1 border border-theme-border relative transition-colors"
                aria-label="Toggle Light/Dark Theme"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-theme-accent transition-transform duration-200 flex items-center justify-center text-white ${
                    theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                  }`}
                >
                  {theme === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                </div>
              </button>
            </div>

            {/* Disappearing Rules */}
            <div className="flex items-center justify-between pt-6">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-theme-primaryText flex items-center gap-2">
                  <Flame className="w-4 h-4 text-theme-danger" />
                  Auto-Destruct Mode
                </h4>
                <p className="text-xs text-theme-secondaryText">Messages permanently vanish from server and clients as soon as you exit the conversation</p>
              </div>
              <Badge variant="accent">Chat Exit Trigger</Badge>
            </div>

            {/* Socket Auto-Reconnect */}
            <div className="flex items-center justify-between pt-6">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-theme-primaryText flex items-center gap-2">
                  <Lock className="w-4 h-4 text-theme-success" />
                  Real-Time WebSocket Sync
                </h4>
                <p className="text-xs text-theme-secondaryText">Automatic reconnect and 25s ping/pong heartbeat tracking</p>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
