const asyncHandler = require('../utils/asyncHandler');
const Submission = require('../models/Submission');
const TestCase = require('../models/TestCase');
const { runSingleTestCase } = require('../services/judging/testRunner');
const { evaluateAllTestCases } = require('../services/judging/judgingService');

exports.runCode = asyncHandler(async (req, res) => {
  const { code, language, input } = req.body;
  const outcome = await runSingleTestCase({
    sourceCode: code,
    language,
    input: input || '',
    expectedOutput: '',
  });

  res.json({
    success: true,
    output: outcome.stdout || outcome.stderr || outcome.compileOutput,
    compileError: outcome.compileOutput,
    runtimeError: outcome.stderr,
    status: outcome.status,
  });
});

exports.submitSolution = asyncHandler(async (req, res) => {
  const { code, language, challengeId } = req.body;
  const testCases = await TestCase.find({ challengeId });

  const evalResult = await evaluateAllTestCases({
    sourceCode: code,
    language,
    testCases,
  });

  const sub = await Submission.create({
    userId: req.user?._id,
    challengeId,
    code,
    language,
    status: evalResult.overallStatus,
    testCasesPassed: evalResult.passedCount,
    totalTestCases: evalResult.totalCount,
  });

  res.json({
    success: true,
    submissionId: sub._id,
    status: evalResult.overallStatus,
    testResults: evalResult.details,
    passedCount: evalResult.passedCount,
    totalCount: evalResult.totalCount,
  });
});

exports.getSubmissionById = asyncHandler(async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  res.json({ success: true, submission: sub });
});

exports.getUserHistory = asyncHandler(async (req, res) => {
  const history = await Submission.find({ userId: req.user?._id, challengeId: req.params.challengeId });
  res.json({ success: true, history });
});
