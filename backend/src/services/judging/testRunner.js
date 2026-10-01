const { createSubmission } = require('../judge0/createSubmission');
const { compareOutputs } = require('./outputComparator');
const { mapJudge0Status } = require('./resultMapper');

exports.runSingleTestCase = async ({ sourceCode, language, input, expectedOutput }) => {
  const result = await createSubmission({ sourceCode, language, stdin: input, expectedOutput });
  
  const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8') : '';
  const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf8') : '';
  const compileOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf8') : '';

  const passed = result.status?.id === 3 || compareOutputs(stdout, expectedOutput);

  return {
    passed,
    status: mapJudge0Status(result.status?.id),
    stdout,
    stderr,
    compileOutput,
    time: result.time,
    memory: result.memory,
  };
};
