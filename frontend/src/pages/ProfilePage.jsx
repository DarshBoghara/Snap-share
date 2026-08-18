import React, { useState } from 'react';
import { Camera, Check, Mail, User, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Avatar } from '../components/common/Avatar';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState(user?.profile_image || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    setLoading(true);
    try {
      await userService.updateProfile({
        username: username.trim(),
        profile_image: profileImage.trim() || null
      });
      await refreshUser();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg transition-colors duration-250">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8">
        <div className="glass-panel p-6 sm:p-8 rounded-card border border-theme-border shadow-elevated space-y-8">
          <div className="flex items-center space-x-4 border-b border-theme-border pb-6">
            <Avatar username={user?.username} image={user?.profile_image} size="xl" isOnline={true} />
            <div>
              <h2 className="text-2xl font-bold text-theme-primaryText">{user?.username}</h2>
              <p className="text-sm text-theme-secondaryText">{user?.email}</p>
              <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-theme-success/10 text-theme-success border border-theme-success/30 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Ephemerality Verified Account</span>
              </div>
            </div>
          </div>

          {success && (
            <div className="p-3.5 rounded-input bg-theme-success/10 border border-theme-success/30 text-xs font-semibold text-theme-success flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-input bg-theme-danger/10 border border-theme-danger/30 text-xs font-semibold text-theme-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              icon={User}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Email Address (Read Only)"
              type="email"
              icon={Mail}
              value={user?.email || ''}
              disabled
              className="opacity-60 cursor-not-allowed"
            />

            <Input
              label="Profile Image URL"
              type="url"
              placeholder="https://example.com/avatar.png"
              icon={Camera}
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
            />
            

            <Button type="submit" variant="primary" size="lg" isLoading={loading}>
              Save Profile Changes
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};
