import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      navigate('/chat');
    } catch (err) {
      console.error('Registration failed:', err);
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg).join(', '));
      } else {
        setError('Registration failed. Username or email may already be taken.');
      }
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
          <h2 className="text-3xl font-extrabold text-theme-primaryText tracking-tight">Create Account</h2>
          <p className="text-sm text-theme-secondaryText">Join the real-time disappearing chat network</p>
        </div>

        {/* Register Card */}
        <div className="glass-panel p-8 rounded-card border border-theme-border shadow-elevated space-y-6">
          {error && (
            <div className="p-3.5 rounded-input bg-theme-danger/10 border border-theme-danger/30 text-xs font-semibold text-theme-danger text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="e.g. alex99"
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (min 6 chars)"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" fullWidth size="lg" isLoading={loading}>
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-theme-secondaryText pt-2 border-t border-theme-border">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-theme-accent hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
