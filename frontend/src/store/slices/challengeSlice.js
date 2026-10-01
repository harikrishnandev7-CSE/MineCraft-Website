import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentChallenge: null,
  allChallenges: [],
  selectedLanguage: 'python',
  timeRemaining: 0,
  loading: false,
  error: null,
};

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    setCurrentChallenge: (state, action) => {
      state.currentChallenge = action.payload;
    },
    setAllChallenges: (state, action) => {
      state.allChallenges = action.payload;
    },
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setTimeRemaining: (state, action) => {
      state.timeRemaining = action.payload;
    },
    decrementTimer: (state) => {
      if (state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },
    setChallengeLoading: (state, action) => {
      state.loading = action.payload;
    },
    setChallengeError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentChallenge,
  setAllChallenges,
  setSelectedLanguage,
  setTimeRemaining,
  decrementTimer,
  setChallengeLoading,
  setChallengeError,
} = challengeSlice.actions;

export default challengeSlice.reducer;
