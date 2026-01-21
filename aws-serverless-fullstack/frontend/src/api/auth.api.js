import api from './axios';

export const authAPI = {
  async signup(email, password) {
    const response = await api.post('/auth/signup', { email, password });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await api.get('/me');
    return response.data;
  }
};
