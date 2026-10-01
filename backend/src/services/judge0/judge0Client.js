const axios = require('axios');
const judge0Config = require('../../config/judge0');

const judge0Client = axios.create({
  baseURL: judge0Config.baseURL,
  headers: judge0Config.headers,
  timeout: judge0Config.timeoutMs,
});

module.exports = judge0Client;
