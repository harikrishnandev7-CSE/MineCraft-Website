const asyncHandler = require('../utils/asyncHandler');
const Submission = require('../models/Submission');
const TestCase = require('../models/TestCase');
const Challenge = require('../models/Challenge');
const ParticipantSession = require('../models/ParticipantSession');
const { runSingleTestCase } = require('../services/judging/testRunner');
const { evaluateAllTestCases } = require('../services/judging/judgingService');
const { calculateSubmissionScore } = require('../services/judging/scoringService');

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
    time: outcome.time,
    memory: outcome.memory,
  });
});

exports.submitSolution = asyncHandler(async (req, res) => {
  const { code, language, challengeId, assembledBlockIds } = req.body;

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  const testCases = await TestCase.find({ challengeId, isEnabled: true });

  // Evaluate test cases
  const evalResult = await evaluateAllTestCases({
    sourceCode: code,
    language,
    testCases,
  });

  // Fetch or create participant session for tracking penalties and score
  let session = null;
  if (req.user) {
    session = await ParticipantSession.findOne({ userId: req.user._id, challengeId });
    if (!session) {
      session = await ParticipantSession.create({
        userId: req.user._id,
        challengeId,
        revealedBlockIds: [],
        revealsCount: 0,
      });
    }
  }

  const isAccepted = evalResult.overallStatus === 'ACCEPTED';
  const wrongAttempts = (session?.wrongAttemptsCount || 0) + (isAccepted ? 0 : 1);

  // Compute scoring
  const scoreBreakdown = calculateSubmissionScore({
    challenge,
    testCases,
    testResults: evalResult.details,
    revealsCount: session?.revealsCount || 0,
    wrongAttemptsCount: wrongAttempts,
  });

  // Record submission in DB
  const sub = await Submission.create({
    userId: req.user?._id,
    challengeId,
    code,
    language,
    assembledBlockIds: Array.isArray(assembledBlockIds) ? assembledBlockIds : [],
    status: evalResult.overallStatus,
    testCasesPassed: evalResult.passedCount,
    totalTestCases: evalResult.totalCount,
    score: scoreBreakdown.finalScore,
    revealPenalty: scoreBreakdown.revealPenalty,
    wrongSubmissionPenalty: scoreBreakdown.wrongSubmissionPenalty,
    testCaseResults: evalResult.details.map((d) => {
      const tc = testCases.find((t) => t._id.toString() === d.testCaseId?.toString());
      return {
        testCaseId: d.testCaseId,
        passed: d.passed,
        input: tc ? tc.input : '',
        expectedOutput: tc ? tc.expectedOutput : '',
        actualOutput: d.stdout || '',
        compileError: d.compileOutput || '',
        runtimeError: d.stderr || '',
        isHidden: tc ? tc.isHidden : false,
        status: d.status,
        time: d.time,
      };
    }),
  });

  // Update session
  if (session) {
    session.wrongAttemptsCount = wrongAttempts;
    if (scoreBreakdown.finalScore > (session.scoreAwarded || 0)) {
      session.scoreAwarded = scoreBreakdown.finalScore;
    }
    if (isAccepted) {
      session.isCompleted = true;
      session.status = 'COMPLETED';
      session.endTime = new Date();
    }
    session.lastActivityAt = new Date();
    await session.save();
  }

  // Sanitize test results for participant response (DO NOT reveal expected output of hidden tests!)
  const sanitizedResults = evalResult.details.map((d) => {
    const tc = testCases.find((t) => t._id.toString() === d.testCaseId?.toString());
    const isHidden = tc ? tc.isHidden : false;
    return {
      testCaseId: d.testCaseId,
      passed: d.passed,
      status: d.status,
      isHidden,
      input: isHidden ? '[Hidden]' : tc?.input,
      expectedOutput: isHidden ? '[Hidden]' : tc?.expectedOutput,
      actualOutput: isHidden ? (d.passed ? '[Matched]' : '[Hidden]') : d.stdout,
      time: d.time,
    };
  });

  res.json({
    success: true,
    submissionId: sub._id,
    status: evalResult.overallStatus,
    score: scoreBreakdown.finalScore,
    testResults: sanitizedResults,
    passedCount: evalResult.passedCount,
    totalCount: evalResult.totalCount,
    penalties: scoreBreakdown.totalPenalties,
  });
});

exports.getSubmissionById = asyncHandler(async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  res.json({ success: true, submission: sub });
});

exports.getUserHistory = asyncHandler(async (req, res) => {
  const history = await Submission.find({ userId: req.user?._id, challengeId: req.params.challengeId }).sort({
    createdAt: -1,
  });
  res.json({ success: true, history });
});
