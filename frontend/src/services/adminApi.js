import api from './api';

export const adminApi = {
  getOverview: async () => {
    const { data } = await api.get('/admin/overview');
    return data;
  },
  getParticipants: async () => {
    const { data } = await api.get('/admin/participants');
    return data;
  },
  createChallenge: async (challengeData) => {
    const { data } = await api.post('/admin/challenges', challengeData);
    return data;
  },
  updateChallenge: async (id, challengeData) => {
    const { data } = await api.put(`/admin/challenges/${id}`, challengeData);
    return data;
  },
  generateQRBatch: async (challengeId) => {
    const { data } = await api.post(`/admin/challenges/${challengeId}/generate-qr`);
    return data;
  },
  getSessions: async () => {
    const { data } = await api.get('/admin/sessions');
    return data;
  },
  getSubmissions: async () => {
    const { data } = await api.get('/admin/submissions');
    return data;
  },
  updateSettings: async (settings) => {
    const { data } = await api.put('/admin/settings', settings);
    return data;
  },
};
