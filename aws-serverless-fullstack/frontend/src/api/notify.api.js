import api from './axios';

export const notifyAPI = {
  async sendNotification(message) {
    const response = await api.post('/notify', { message });
    return response;
  },
  
  async subscribeEmail(email) {
    const response = await api.post('/subscribe', { email });
    return response;
  },
  
  async getSubscribers() {
    const response = await api.get('/subscribers');
    return response;
  },
  
  async unsubscribeEmail(subscriptionArn) {
    const response = await api.post('/unsubscribe', { subscriptionArn });
    return response;
  }
};
