// In /frontend/src/api/stream.api.js

import api from "./axios";

export const streamAPI = {
  sendToKinesis: async (message) => {
    return api.post('/stream', { message });
  },
  getKinesisEvents: async () => {
    return api.get('/events');
  }
};