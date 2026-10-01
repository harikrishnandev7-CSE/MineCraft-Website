import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rankings: [],
  userRank: null,
  lastUpdated: null,
  loading: false,
  error: null,
};

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setLeaderboardData: (state, action) => {
      state.rankings = action.payload.rankings || [];
      state.userRank = action.payload.userRank || null;
      state.lastUpdated = new Date().toISOString();
      state.loading = false;
    },
    setLeaderboardLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLeaderboardError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setLeaderboardData,
  setLeaderboardLoading,
  setLeaderboardError,
} = leaderboardSlice.actions;

export default leaderboardSlice.reducer;
