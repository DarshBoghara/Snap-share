import { api } from './api';

export const authService = {
  async register(username, email, password) {
    const res = await api.post('/auth/register', { username, email, password });
    return res.data;
  },

  async login(username_or_email, password) {
    const res = await api.post('/auth/login', { username_or_email, password });
    return res.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};
