const env = require('./env');

module.exports = {
  baseURL: env.JUDGE0_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(env.JUDGE0_API_KEY ? { 'X-Auth-Token': env.JUDGE0_API_KEY } : {}),
  },
  timeoutMs: 15000,
};
