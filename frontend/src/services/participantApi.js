import api from './api';

export const participantApi = {
  register: async (participantData) => {
    const { data } = await api.post('/participants/register', participantData);
    return data;
  },
  joinSession: async (sessionCode) => {
    const { data } = await api.post('/participants/join', { sessionCode });
    return data;
  },
  getStatus: async () => {
    const { data } = await api.get('/participants/status');
    return data;
  },
};
