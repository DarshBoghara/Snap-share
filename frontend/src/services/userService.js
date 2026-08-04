import { api } from './api';

export const userService = {
  async getMyProfile() {
    const res = await api.get('/users/me');
    return res.data;
  },

  async updateProfile(payload) {
    const res = await api.put('/users/me', payload);
    return res.data;
  },

  async searchUsers(query) {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data;
  }
};
