import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, MessageSquare, ShieldCheck, Zap, Lock, EyeOff } from 'lucide-react';
import { Button } from '../components/common/Button';

export const SplashPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-theme-bg relative overflow-hidden transition-colors duration-250">
      {/* Background Decorative Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-theme-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-button bg-theme-accent flex items-center justify-center shadow-md">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-theme-primaryText tracking-tight">SNAP<span className="text-theme-accent">SHARE</span></span>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-theme-secondaryBg border border-theme-border mb-8 shadow-sm">
          <Flame className="w-4 h-4 text-theme-accent animate-pulse" />
          <span className="text-xs font-semibold text-theme-secondaryText">Zero Data Retention Ephemeral Chat</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-theme-primaryText tracking-tight leading-tight max-w-4xl">
          Messages that <span className="bg-gradient-to-r from-theme-accent to-blue-500 bg-clip-text text-transparent">disappear when they're seen.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-theme-secondaryText max-w-2xl font-normal leading-relaxed">
          High-performance, privacy-focused real-time private messaging. Messages remain visible while chatting, then permanently vaporize from servers and databases the moment the receiver reads them.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/register">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-3.5">
              Start Chatting Now
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-3.5">
              Existing Account Login
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-card glass-panel hover:border-theme-accent/40 transition-all duration-250">
            <div className="w-12 h-12 rounded-button bg-theme-accent/10 flex items-center justify-center text-theme-accent mb-4">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-theme-primaryText mb-2">Instant Purge Engine</h3>
            <p className="text-sm text-theme-secondaryText leading-relaxed">
              Messages are permanently deleted from database storage immediately when opened by the recipient.
            </p>
          </div>

          <div className="p-6 rounded-card glass-panel hover:border-theme-accent/40 transition-all duration-250">
            <div className="w-12 h-12 rounded-button bg-theme-success/10 flex items-center justify-center text-theme-success mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-theme-primaryText mb-2">Sub-10ms Real-Time Sync</h3>
            <p className="text-sm text-theme-secondaryText leading-relaxed">
              FastAPI WebSockets and distributed Redis Pub/Sub synchronization deliver real-time messages across multi-server clusters.
            </p>
          </div>

          <div className="p-6 rounded-card glass-panel hover:border-theme-accent/40 transition-all duration-250">
            <div className="w-12 h-12 rounded-button bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-theme-primaryText mb-2">Production Security</h3>
            <p className="text-sm text-theme-secondaryText leading-relaxed">
              JWT token rotation, bcrypt password security, rate limiting, and CORS/XSS protections for enterprise privacy.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-theme-border text-center text-xs text-theme-mutedText z-10">
        SNAPSHARE &copy; {new Date().getFullYear()} — Built for high-speed ephemeral real-time communication.
      </footer>
    </div>
  );
};
