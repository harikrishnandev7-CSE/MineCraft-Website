const { runSingleTestCase } = require('./testRunner');

exports.evaluateAllTestCases = async ({ sourceCode, language, testCases = [] }) => {
  const results = [];
  let allPassed = true;

  for (const tc of testCases) {
    const outcome = await runSingleTestCase({
      sourceCode,
      language,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    });
    results.push({ testCaseId: tc._id, passed: outcome.passed, ...outcome });
    if (!outcome.passed) {
      allPassed = false;
    }
  }

  return {
    overallStatus: allPassed ? 'ACCEPTED' : 'WRONG_ANSWER',
    passedCount: results.filter((r) => r.passed).length,
    totalCount: testCases.length,
    details: results,
  };
};
