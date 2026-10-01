import api from './api';

export const leaderboardApi = {
  getLiveLeaderboard: async (eventId) => {
    const { data } = await api.get('/leaderboard', { params: { eventId } });
    return data;
  },
  getMyRank: async () => {
    const { data } = await api.get('/leaderboard/my-rank');
    return data;
  },
};
