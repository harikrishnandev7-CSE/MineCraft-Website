import api, { runCode, submitSolution } from './api';

export const submissionApi = {
  runCode: async ({ code, sourceCode, language, input, stdin, challengeId }) => {
    return runCode(language, sourceCode || code, stdin || input || '');
  },
  submitSolution: async ({ code, sourceCode, language, challengeId, blocksUsed }) => {
    return submitSolution(language, sourceCode || code, challengeId);
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
