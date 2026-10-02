import api from './api';

export const challengeApi = {
  getAll: async () => {
    const { data } = await api.get('/challenges');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/challenges/${id}`);
    return data;
  },
  getActiveChallenge: async () => {
    const { data } = await api.get('/challenges/active');
    return data;
  },
  getBlocks: async (id) => {
    const { data } = await api.get(`/challenges/${id}/blocks`);
    return data;
  },
  revealBlock: async (id, payload = {}) => {
    const { data } = await api.post(`/challenges/${id}/reveal`, payload);
    return data;
  },
};
