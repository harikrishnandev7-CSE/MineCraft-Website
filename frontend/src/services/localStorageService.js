import { STORAGE_KEYS } from '../utils/constants';

export const localStorageService = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`[LocalStorage] Error reading ${key}:`, e);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[LocalStorage] Error writing ${key}:`, e);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[LocalStorage] Error removing ${key}:`, e);
    }
  },

  clearAllChallengeData: () => {
    Object.values(STORAGE_KEYS).forEach((k) => {
      if (k !== STORAGE_KEYS.LEADERBOARD) {
        localStorage.removeItem(k);
      }
    });
  },
};
