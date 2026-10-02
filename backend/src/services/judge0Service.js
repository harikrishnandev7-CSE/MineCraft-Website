const axios = require('axios');
const judge0Config = require('../config/judge0');

const client = axios.create({
  baseURL: judge0Config.baseURL,
  headers: judge0Config.headers,
  httpsAgent: judge0Config.httpsAgent,
  timeout: judge0Config.timeoutMs,
});

/**
 * Creates an asynchronous execution submission on Judge0
 */
async function createSubmission({ sourceCode, languageId, stdin = '' }) {
  const payload = {
    source_code: sourceCode,
    language_id: languageId,
    stdin: typeof stdin === 'string' ? stdin : String(stdin || ''),
  };

  const response = await client.post('/submissions?base64_encoded=false&wait=false', payload);
  return response.data;
}

/**
 * Fetches submission result from Judge0 with automatic fallback to base64 encoding
 * if compiler output contains non-UTF8 binary characters
 */
async function getSubmission(subToken) {
  try {
    const response = await client.get(`/submissions/${subToken}?base64_encoded=false`);
    return response.data;
  } catch (err) {
    const errMsg = err.response?.data?.error || '';
    if (errMsg.includes('base64_encoded=true')) {
      const b64Res = await client.get(`/submissions/${subToken}?base64_encoded=true`);
      const data = b64Res.data;
      const decode = (val) => (val ? Buffer.from(val, 'base64').toString('utf8') : null);
      return {
        ...data,
        stdout: decode(data.stdout),
        stderr: decode(data.stderr),
        compile_output: decode(data.compile_output),
        message: decode(data.message),
      };
    }
    throw err;
  }
}

/**
 * Polls Judge0 until execution completes or max attempts reached
 */
async function pollSubmission(subToken, maxAttempts = 20, delayMs = 500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const result = await getSubmission(subToken);
    const statusId = result.status?.id;

    // Status >= 3 indicates completed (Accepted, Wrong Answer, Error, etc.)
    if (statusId && statusId >= 3) {
      return formatJudge0Result(result);
    }
  }

  return {
    success: false,
    status: 'Time Limit Exceeded',
    stdout: '',
    stderr: 'Execution timed out waiting for sandbox result.',
    compileOutput: '',
    message: 'Execution took longer than allowed timeout window.',
    time: '',
    memory: 0,
  };
}

/**
 * Normalizes Judge0 execution payload into a frontend-friendly structure
 */
function formatJudge0Result(data) {
  const statusDesc = data.status?.description || 'Unknown';
  const isAccepted = data.status?.id === 3;

  return {
    success: isAccepted,
    status: statusDesc,
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compileOutput: data.compile_output || '',
    message: data.message || '',
    time: data.time ? String(data.time) : '',
    memory: data.memory || 0,
  };
}

/**
 * Convenience helper to submit and poll in a single pipeline
 */
async function executeCode({ sourceCode, languageId, stdin = '' }) {
  const sub = await createSubmission({ sourceCode, languageId, stdin });
  if (!sub?.token) {
    throw new Error('Judge0 failed to generate submission token');
  }
  return await pollSubmission(sub.token);
}

module.exports = {
  createSubmission,
  getSubmission,
  pollSubmission,
  executeCode,
  formatJudge0Result,
};
