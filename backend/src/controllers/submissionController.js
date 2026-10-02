const { getLanguageId, isSupportedLanguage } = require('../utils/languageMap');
const { executeCode } = require('../services/judge0Service');
const { getHiddenTests } = require('../config/challenges');

/**
 * Normalizes output string for comparison
 */
function normalizeOutput(str = '') {
  return String(str || '')
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * Handles "Run Code" visible / sample execution
 * POST /api/submissions/run
 */
exports.runCode = async (req, res) => {
  try {
    const language = req.body?.language;
    const sourceCode = req.body?.sourceCode !== undefined ? req.body.sourceCode : req.body?.code;
    const stdin = req.body?.stdin !== undefined ? req.body.stdin : (req.body?.input !== undefined ? req.body.input : '');

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Language is required',
      });
    }

    if (!isSupportedLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: '${language}'. Supported languages: c, cpp, java, python`,
      });
    }

    if (!sourceCode || typeof sourceCode !== 'string' || !sourceCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source code cannot be empty',
      });
    }

    const languageId = getLanguageId(language);
    const result = await executeCode({
      sourceCode: sourceCode.trim(),
      languageId,
      stdin: typeof stdin === 'string' ? stdin : String(stdin || ''),
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[SubmissionController.runCode] Error:', error.message);
    return res.status(500).json({
      success: false,
      status: 'Internal Error',
      stdout: '',
      stderr: 'Unable to execute code via execution sandbox. Please try again.',
      compileOutput: '',
      message: error.message || 'Execution service error',
      time: '',
      memory: 0,
    });
  }
};

/**
 * Handles official challenge submission and evaluates against hidden test cases
 * POST /api/submissions/submit
 */
exports.submitSolution = async (req, res) => {
  try {
    const language = req.body?.language;
    const sourceCode = req.body?.sourceCode !== undefined ? req.body.sourceCode : req.body?.code;
    const challengeId = req.body?.challengeId || 'ch-01';

    if (!language || !isSupportedLanguage(language)) {
      return res.status(400).json({
        success: false,
        message: 'Valid language (c, cpp, java, python) is required',
      });
    }

    if (!sourceCode || !sourceCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source code cannot be empty',
      });
    }

    const languageId = getLanguageId(language);
    const hiddenTests = getHiddenTests(challengeId);
    const testResults = [];
    let allPassed = true;
    let totalTime = 0;
    let maxMemory = 0;

    for (const testCase of hiddenTests) {
      const outcome = await executeCode({
        sourceCode: sourceCode.trim(),
        languageId,
        stdin: testCase.input,
      });

      if (outcome.time) totalTime += parseFloat(outcome.time) || 0;
      if (outcome.memory) maxMemory = Math.max(maxMemory, outcome.memory);

      // If compilation error occurs on any test, abort further tests immediately
      if (outcome.status === 'Compilation Error') {
        return res.status(200).json({
          success: false,
          status: 'COMPILATION_ERROR',
          title: '⚠️ COMPILATION ERROR',
          message: outcome.compileOutput || outcome.stderr || 'Code failed compilation.',
          passedCount: 0,
          totalCount: hiddenTests.length,
          testResults: hiddenTests.map((t) => ({
            id: t.id,
            status: 'FAILED (Compilation Error)',
            time: '0.00s',
            memory: 0,
          })),
          executionTime: '0.00s',
          memory: '0.0 MB',
          compileOutput: outcome.compileOutput || outcome.stderr,
          stdout: outcome.stdout,
          stderr: outcome.stderr,
        });
      }

      const actualOut = normalizeOutput(outcome.stdout);
      const expectedOut = normalizeOutput(testCase.expectedOutput);
      const isCorrect = outcome.status === 'Accepted' && actualOut === expectedOut;

      testResults.push({
        id: testCase.id,
        status: isCorrect ? 'PASSED' : `FAILED (${outcome.status === 'Accepted' ? 'Output Mismatch' : outcome.status})`,
        time: outcome.time ? `${outcome.time}s` : '0.02s',
        memory: outcome.memory,
      });

      if (!isCorrect) {
        allPassed = false;
      }
    }

    const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
    const finalStatus = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

    return res.status(200).json({
      success: allPassed,
      status: finalStatus,
      title: allPassed ? '🎉 ACCEPTED' : '❌ WRONG ANSWER',
      message: allPassed
        ? 'All test cases passed successfully!'
        : 'Some hidden test cases failed. Re-evaluate your block arrangement.',
      passedCount,
      totalCount: hiddenTests.length,
      testResults,
      executionTime: `${totalTime.toFixed(3)}s`,
      memory: `${(maxMemory / 1024).toFixed(1)} MB`,
    });
  } catch (error) {
    console.error('[SubmissionController.submitSolution] Error:', error.message);
    return res.status(500).json({
      success: false,
      status: 'Internal Error',
      title: '⚠️ EXECUTION ERROR',
      message: 'Failed to evaluate challenge submission. Please try again.',
      passedCount: 0,
      totalCount: 3,
      testResults: [],
      executionTime: '0.00s',
      memory: '0.0 MB',
    });
  }
};
