import { api } from './api';

export const messageService = {
  async getConversation(otherUserId) {
    const res = await api.get(`/messages/conversation/${otherUserId}`);
    return res.data;
  },

  async getUnreadCounts() {
    const res = await api.get('/messages/unread-counts');
    return res.data;
  },

  async sendMessage(receiverId, message) {
    const res = await api.post('/messages/', { receiver_id: receiverId, message });
    return res.data;
  },

  async markReadAndDelete(messageId) {
    const res = await api.delete(`/messages/read/${messageId}`);
    return res.data;
  }
};
