import api from './axios';

export const userAPI = {
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  }
};
