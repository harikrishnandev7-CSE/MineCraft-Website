import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import challengeReducer from './slices/challengeSlice';
import qrReducer from './slices/qrSlice';
import assemblyReducer from './slices/assemblySlice';
import executionReducer from './slices/executionSlice';
import leaderboardReducer from './slices/leaderboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    challenge: challengeReducer,
    qr: qrReducer,
    assembly: assemblyReducer,
    execution: executionReducer,
    leaderboard: leaderboardReducer,
  },
});

export default store;
