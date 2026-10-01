import api from './api';

export const submissionApi = {
  runCode: async ({ code, language, input, challengeId }) => {
    const { data } = await api.post('/submissions/run', { code, language, input, challengeId });
    return data;
  },
  submitSolution: async ({ code, language, challengeId, blocksUsed }) => {
    const { data } = await api.post('/submissions/submit', { code, language, challengeId, blocksUsed });
    return data;
  },
  getSubmissionStatus: async (submissionId) => {
    const { data } = await api.get(`/submissions/${submissionId}`);
    return data;
  },
  getUserSubmissions: async (challengeId) => {
    const { data } = await api.get(`/submissions/history/${challengeId}`);
    return data;
  },
};
