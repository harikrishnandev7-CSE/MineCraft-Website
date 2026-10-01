import api from './api';

export const qrApi = {
  scanBlock: async ({ qrCode, challengeId }) => {
    const { data } = await api.post('/qr/scan', { qrCode, challengeId });
    return data;
  },
  getScannedBlocks: async (challengeId) => {
    const { data } = await api.get(`/qr/scanned/${challengeId}`);
    return data;
  },
};
