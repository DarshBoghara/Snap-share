import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your username/email and password');
      return;
    }

    setLoading(true);
    try {
      await login(identifier.trim(), password);
      navigate('/chat');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-theme-bg relative overflow-hidden transition-colors duration-250">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-theme-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block">
            <div className="w-14 h-14 rounded-button bg-theme-accent flex items-center justify-center mx-auto shadow-elevated">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold text-theme-primaryText tracking-tight">Welcome Back</h2>
          <p className="text-sm text-theme-secondaryText">Sign in to resume private disappearing conversations</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-card border border-theme-border shadow-elevated space-y-6">
          {error && (
            <div className="p-3.5 rounded-input bg-theme-danger/10 border border-theme-danger/30 text-xs font-semibold text-theme-danger text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username or Email"
              type="text"
              placeholder="e.g. alex or alex@example.com"
              icon={Mail}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth size="lg" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-theme-secondaryText pt-2 border-t border-theme-border">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-theme-accent hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
