import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentChallenge,
  setSelectedLanguage,
  setChallengeLoading,
  setChallengeError,
} from '../store/slices/challengeSlice';
import { challengeApi } from '../services/challengeApi';

export function useChallenge() {
  const dispatch = useDispatch();
  const challenge = useSelector((state) => state.challenge);

  const fetchActiveChallenge = async () => {
    dispatch(setChallengeLoading(true));
    try {
      const data = await challengeApi.getActiveChallenge();
      dispatch(setCurrentChallenge(data));
      return data;
    } catch (err) {
      dispatch(setChallengeError(err.message));
      throw err;
    } finally {
      dispatch(setChallengeLoading(false));
    }
  };

  const setLanguage = (lang) => {
    dispatch(setSelectedLanguage(lang));
  };

  return {
    ...challenge,
    fetchActiveChallenge,
    setLanguage,
  };
}
