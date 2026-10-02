const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const QRBlock = require('../models/QRBlock');
const TestCase = require('../models/TestCase');
const Submission = require('../models/Submission');
const ParticipantSession = require('../models/ParticipantSession');
const Settings = require('../models/Settings');
const { generateCodeBlocks } = require('../services/challenge/codeBlockSplitter');
const { getLeaderboardData } = require('../services/leaderboard/leaderboardService');
const { generateExcelReport } = require('../services/reports/excelExportService');
const { generatePdfReport } = require('../services/reports/pdfExportService');

/**
 * OVERVIEW / DASHBOARD STATS
 */
exports.getOverview = asyncHandler(async (req, res) => {
  const [
    totalParticipants,
    activeContestantIds,
    totalChallenges,
    publishedChallenges,
    totalSubmissions,
    acceptedSubmissions,
    wrongAnswers,
    activeSessionsCount,
    recentSubmissions,
    activeSessions,
  ] = await Promise.all([
    User.countDocuments({ role: 'participant' }),
    ParticipantSession.distinct('userId', { isCompleted: false }),
    Challenge.countDocuments(),
    Challenge.countDocuments({ status: 'Published' }),
    Submission.countDocuments(),
    Submission.countDocuments({ status: 'ACCEPTED' }),
    Submission.countDocuments({ status: 'WRONG_ANSWER' }),
    ParticipantSession.countDocuments({ isCompleted: false }),
    Submission.find()
      .populate('userId', 'name email')
      .populate('challengeId', 'title')
      .sort({ createdAt: -1 })
      .limit(8),
    ParticipantSession.find({ isCompleted: false })
      .populate('userId', 'name email')
      .populate('challengeId', 'title points duration timeLimitSeconds')
      .sort({ lastActivityAt: -1 })
      .limit(10),
  ]);

  const liveSessions = activeSessions.map((s) => {
    const elapsed = Math.round((Date.now() - new Date(s.startTime).getTime()) / 1000);
    const totalSec = s.durationSeconds || 1200;
    const remainingSec = Math.max(0, totalSec - elapsed);
    const mins = Math.floor(remainingSec / 60);
    const secs = remainingSec % 60;

    return {
      id: s._id,
      participantName: s.userId?.name || 'Contestant',
      participantEmail: s.userId?.email || 'N/A',
      challengeTitle: s.challengeId?.title || 'Unknown Challenge',
      currentScore: s.scoreAwarded || 0,
      timeRemaining: `${mins}:${String(secs).padStart(2, '0')}`,
      status: s.status || 'ACTIVE',
      revealsCount: s.revealsCount || 0,
      blocksCount: (s.revealedBlockIds || []).length,
      lastActivityAt: s.lastActivityAt || s.updatedAt,
    };
  });

  res.json({
    success: true,
    stats: {
      totalParticipants,
      activeParticipants: activeContestantIds.length,
      totalChallenges,
      publishedChallenges,
      totalSubmissions,
      acceptedSubmissions,
      wrongAnswers,
      activeSessions: activeSessionsCount,
    },
    liveSessions,
    recentSubmissions: recentSubmissions.map((sub) => ({
      id: sub._id,
      participant: sub.userId?.name || 'Anonymous',
      challenge: sub.challengeId?.title || 'Unknown',
      language: (sub.language || 'code').toUpperCase(),
      status: sub.status,
      score: sub.score || 0,
      executionTime: sub.executionTimeMs ? `${sub.executionTimeMs}ms` : '0ms',
      submittedAt: sub.createdAt,
    })),
  });
});

/**
 * CHALLENGE MANAGEMENT
 */
exports.getChallenges = asyncHandler(async (req, res) => {
  const { search, difficulty, status, category, language } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }
  if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;
  if (status && status !== 'All') filter.status = status;
  if (category && category !== 'All') filter.category = category;
  if (language && language !== 'All') filter.sourceLanguage = language;

  const challenges = await Challenge.find(filter).sort({ createdAt: -1 });

  // Enrich with block count and test case count
  const challengeIds = challenges.map((c) => c._id);
  const [blockCounts, testCaseCounts] = await Promise.all([
    QRBlock.aggregate([
      { $match: { challengeId: { $in: challengeIds } } },
      { $group: { _id: '$challengeId', count: { $sum: 1 } } },
    ]),
    TestCase.aggregate([
      { $match: { challengeId: { $in: challengeIds } } },
      { $group: { _id: '$challengeId', count: { $sum: 1 } } },
    ]),
  ]);

  const blockMap = Object.fromEntries(blockCounts.map((b) => [b._id.toString(), b.count]));
  const testMap = Object.fromEntries(testCaseCounts.map((t) => [t._id.toString(), t.count]));

  const enriched = challenges.map((c) => ({
    ...c.toObject(),
    blockCount: blockMap[c._id.toString()] || 0,
    testCaseCount: testMap[c._id.toString()] || 0,
  }));

  res.json({ success: true, challenges: enriched });
});

exports.getChallengeById = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  const [blocks, testCases] = await Promise.all([
    QRBlock.find({ challengeId: challenge._id }).sort({ originalOrder: 1 }),
    TestCase.find({ challengeId: challenge._id }).sort({ orderIndex: 1 }),
  ]);

  res.json({
    success: true,
    challenge: {
      ...challenge.toObject(),
      blocks,
      testCases,
    },
  });
});

exports.createChallenge = asyncHandler(async (req, res) => {
  const { blocks, testCases, ...challengeData } = req.body;

  // Auto-generate slug if missing
  if (!challengeData.slug && challengeData.title) {
    challengeData.slug = challengeData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  const challenge = await Challenge.create(challengeData);

  // If blocks are provided explicitly or generated from sourceCode
  if (Array.isArray(blocks) && blocks.length > 0) {
    const blockDocs = blocks.map((b, idx) => ({
      challengeId: challenge._id,
      blockId: b.blockId || `B${String(idx + 1).padStart(2, '0')}`,
      codeSnippet: b.code || b.codeSnippet,
      originalOrder: b.originalOrder !== undefined ? b.originalOrder : idx + 1,
      displayOrder: b.displayOrder !== undefined ? b.displayOrder : idx + 1,
      orderHint: b.originalOrder !== undefined ? b.originalOrder : idx + 1,
      blockType: b.blockType || 'LOGIC',
      language: b.language || challenge.sourceLanguage || 'java',
      qrHash: b.qrHash || `MC-${challenge.slug.toUpperCase()}-B${idx + 1}-${Math.random().toString(36).substring(2, 7)}`,
      points: b.points || 10,
      isDecoy: !!b.isDecoy,
      hint: b.hint || '',
      isInitiallyVisible: !!b.isInitiallyVisible,
      isLocked: !!b.isLocked,
      taskId: b.taskId,
    }));
    await QRBlock.insertMany(blockDocs);
    await Challenge.findByIdAndUpdate(challenge._id, { 'blockConfig.totalBlocks': blockDocs.length });
  } else if (challenge.sourceCode && challenge.sourceCode.trim()) {
    // Automatically generate blocks and reveal tasks
    const { blocks: generated, tasks: generatedTasks } = generateCodeBlocks({
      sourceCode: challenge.sourceCode,
      language: challenge.sourceLanguage,
      strategy: challenge.splitStrategy || 'statement',
      initialVisibleCount: challenge.blockConfig?.initialVisibleCount || 3,
      randomize: challenge.blockConfig?.randomizeOrder !== false,
      slug: challenge.slug,
    });
    const blockDocs = generated.map((b) => ({ ...b, challengeId: challenge._id }));
    await QRBlock.insertMany(blockDocs);
    await Challenge.findByIdAndUpdate(challenge._id, {
      'blockConfig.totalBlocks': blockDocs.length,
      tasks: (!challenge.tasks || challenge.tasks.length === 0) ? generatedTasks : challenge.tasks,
    });
  }

  // If test cases provided
  if (Array.isArray(testCases) && testCases.length > 0) {
    const testDocs = testCases.map((tc, idx) => ({
      challengeId: challenge._id,
      input: tc.input || '',
      expectedOutput: tc.expectedOutput || '',
      isHidden: !!tc.isHidden,
      weight: tc.weight || 20,
      timeoutSeconds: tc.timeoutSeconds || 5,
      isEnabled: tc.isEnabled !== false,
      orderIndex: idx,
      description: tc.description || '',
    }));
    await TestCase.insertMany(testDocs);
  }

  const finalChallenge = await Challenge.findById(challenge._id);
  res.status(201).json({ success: true, challenge: finalChallenge });
});

exports.updateChallenge = asyncHandler(async (req, res) => {
  const { blocks, testCases, ...updateData } = req.body;

  const challenge = await Challenge.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  // Update blocks if provided
  if (Array.isArray(blocks)) {
    await QRBlock.deleteMany({ challengeId: challenge._id });
    const blockDocs = blocks.map((b, idx) => ({
      challengeId: challenge._id,
      blockId: b.blockId || `B${String(idx + 1).padStart(2, '0')}`,
      codeSnippet: b.code || b.codeSnippet,
      originalOrder: b.originalOrder !== undefined ? b.originalOrder : idx + 1,
      displayOrder: b.displayOrder !== undefined ? b.displayOrder : idx + 1,
      orderHint: b.originalOrder !== undefined ? b.originalOrder : idx + 1,
      blockType: b.blockType || 'LOGIC',
      language: b.language || challenge.sourceLanguage || 'java',
      qrHash: b.qrHash || `MC-${challenge.slug.toUpperCase()}-B${idx + 1}-${Math.random().toString(36).substring(2, 7)}`,
      points: b.points || 10,
      isDecoy: !!b.isDecoy,
      hint: b.hint || '',
      isInitiallyVisible: !!b.isInitiallyVisible,
      isLocked: !!b.isLocked,
      taskId: b.taskId,
    }));
    if (blockDocs.length > 0) {
      await QRBlock.insertMany(blockDocs);
    }
    challenge.blockConfig.totalBlocks = blockDocs.length;
    await challenge.save();
  }

  // Update test cases if provided
  if (Array.isArray(testCases)) {
    await TestCase.deleteMany({ challengeId: challenge._id });
    const testDocs = testCases.map((tc, idx) => ({
      challengeId: challenge._id,
      input: tc.input || '',
      expectedOutput: tc.expectedOutput || '',
      isHidden: !!tc.isHidden,
      weight: tc.weight || 20,
      timeoutSeconds: tc.timeoutSeconds || 5,
      isEnabled: tc.isEnabled !== false,
      orderIndex: idx,
      description: tc.description || '',
    }));
    if (testDocs.length > 0) {
      await TestCase.insertMany(testDocs);
    }
  }

  const populated = await Challenge.findById(challenge._id);
  res.json({ success: true, challenge: populated });
});

exports.deleteChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  await Promise.all([
    Challenge.findByIdAndDelete(challenge._id),
    QRBlock.deleteMany({ challengeId: challenge._id }),
    TestCase.deleteMany({ challengeId: challenge._id }),
    Submission.deleteMany({ challengeId: challenge._id }),
    ParticipantSession.deleteMany({ challengeId: challenge._id }),
  ]);

  res.json({ success: true, message: 'Challenge and associated resources deleted successfully' });
});

exports.duplicateChallenge = asyncHandler(async (req, res) => {
  const source = await Challenge.findById(req.params.id);
  if (!source) {
    return res.status(404).json({ success: false, message: 'Source challenge not found' });
  }

  const [blocks, testCases] = await Promise.all([
    QRBlock.find({ challengeId: source._id }),
    TestCase.find({ challengeId: source._id }),
  ]);

  const timestamp = Date.now().toString().slice(-4);
  const clonedData = source.toObject();
  delete clonedData._id;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;

  clonedData.title = `${source.title} (Copy)`;
  clonedData.slug = `${source.slug}-copy-${timestamp}`;
  clonedData.status = 'Draft';

  const clonedChallenge = await Challenge.create(clonedData);

  if (blocks.length > 0) {
    const clonedBlocks = blocks.map((b) => {
      const obj = b.toObject();
      delete obj._id;
      obj.challengeId = clonedChallenge._id;
      obj.qrHash = `MC-${clonedChallenge.slug.toUpperCase()}-${b.blockId}-${Math.random().toString(36).substring(2, 7)}`;
      return obj;
    });
    await QRBlock.insertMany(clonedBlocks);
  }

  if (testCases.length > 0) {
    const clonedTests = testCases.map((tc) => {
      const obj = tc.toObject();
      delete obj._id;
      obj.challengeId = clonedChallenge._id;
      return obj;
    });
    await TestCase.insertMany(clonedTests);
  }

  res.status(201).json({ success: true, challenge: clonedChallenge });
});

/**
 * BLOCK PARSING AND GENERATION
 */
exports.generateBlocks = asyncHandler(async (req, res) => {
  const { sourceCode, language, strategy, initialVisibleCount, randomize } = req.body;
  const challenge = req.params.id !== 'preview' ? await Challenge.findById(req.params.id) : null;

  const code = sourceCode || challenge?.sourceCode || '';
  const lang = language || challenge?.sourceLanguage || 'java';
  const strat = strategy || challenge?.splitStrategy || 'statement';
  const initialCount = initialVisibleCount !== undefined ? initialVisibleCount : (challenge?.blockConfig?.initialVisibleCount || 3);
  const shouldRandomize = randomize !== undefined ? randomize : (challenge?.blockConfig?.randomizeOrder !== false);

  if (!code.trim()) {
    return res.status(400).json({ success: false, message: 'Source code cannot be empty' });
  }

  const { blocks, tasks } = generateCodeBlocks({
    sourceCode: code,
    language: lang,
    strategy: strat,
    initialVisibleCount: Number(initialCount),
    randomize: !!shouldRandomize,
    slug: challenge?.slug || 'CH',
  });

  res.json({ success: true, blocks, tasks, totalBlocks: blocks.length });
});

exports.getChallengeBlocks = asyncHandler(async (req, res) => {
  const blocks = await QRBlock.find({ challengeId: req.params.id }).sort({ originalOrder: 1 });
  res.json({ success: true, blocks });
});

exports.updateChallengeBlocks = asyncHandler(async (req, res) => {
  const { blocks } = req.body;
  const challengeId = req.params.id;

  if (!Array.isArray(blocks)) {
    return res.status(400).json({ success: false, message: 'Blocks array required' });
  }

  await QRBlock.deleteMany({ challengeId });
  const blockDocs = blocks.map((b, idx) => ({
    challengeId,
    blockId: b.blockId || `B${String(idx + 1).padStart(2, '0')}`,
    codeSnippet: b.code || b.codeSnippet,
    originalOrder: b.originalOrder !== undefined ? b.originalOrder : idx + 1,
    displayOrder: b.displayOrder !== undefined ? b.displayOrder : idx + 1,
    orderHint: b.originalOrder !== undefined ? b.originalOrder : idx + 1,
    blockType: b.blockType || 'LOGIC',
    language: b.language || 'java',
    qrHash: b.qrHash || `MC-B${idx + 1}-${Math.random().toString(36).substring(2, 7)}`,
    points: b.points || 10,
    isDecoy: !!b.isDecoy,
    hint: b.hint || '',
    isInitiallyVisible: !!b.isInitiallyVisible,
    isLocked: !!b.isLocked,
  }));

  if (blockDocs.length > 0) {
    await QRBlock.insertMany(blockDocs);
  }

  await Challenge.findByIdAndUpdate(challengeId, { 'blockConfig.totalBlocks': blockDocs.length });

  res.json({ success: true, blocks: blockDocs });
});

/**
 * TEST CASES
 */
exports.getTestCases = asyncHandler(async (req, res) => {
  const testCases = await TestCase.find({ challengeId: req.params.id }).sort({ orderIndex: 1 });
  res.json({ success: true, testCases });
});

exports.updateTestCases = asyncHandler(async (req, res) => {
  const { testCases } = req.body;
  const challengeId = req.params.id;

  if (!Array.isArray(testCases)) {
    return res.status(400).json({ success: false, message: 'TestCases array required' });
  }

  await TestCase.deleteMany({ challengeId });
  const docs = testCases.map((tc, idx) => ({
    challengeId,
    input: tc.input || '',
    expectedOutput: tc.expectedOutput || '',
    isHidden: !!tc.isHidden,
    weight: tc.weight || 20,
    timeoutSeconds: tc.timeoutSeconds || 5,
    isEnabled: tc.isEnabled !== false,
    orderIndex: idx,
    description: tc.description || '',
  }));

  if (docs.length > 0) {
    await TestCase.insertMany(docs);
  }

  res.json({ success: true, testCases: docs });
});

/**
 * PARTICIPANTS MANAGEMENT
 */
exports.getParticipants = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const userFilter = { role: 'participant' };

  if (search) {
    userFilter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { teamName: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(userFilter);
  const userIds = users.map((u) => u._id);

  const [submissions, sessions] = await Promise.all([
    Submission.find({ userId: { $in: userIds } }),
    ParticipantSession.find({ userId: { $in: userIds } }),
  ]);

  const participants = users.map((u) => {
    const userSubs = submissions.filter((s) => s.userId.toString() === u._id.toString());
    const userSessions = sessions.filter((s) => s.userId.toString() === u._id.toString());

    const acceptedCount = userSubs.filter((s) => s.status === 'ACCEPTED').length;
    const wrongCount = userSubs.filter((s) => s.status === 'WRONG_ANSWER').length;
    const solvedChallengeIds = new Set(
      userSubs.filter((s) => s.status === 'ACCEPTED').map((s) => s.challengeId.toString())
    );

    const totalScore = userSubs.reduce((acc, s) => {
      return acc + (s.score || (s.status === 'ACCEPTED' ? 100 : 0));
    }, 0);

    const totalReveals = userSessions.reduce((acc, s) => acc + (s.revealsCount || 0), 0);
    const hasActiveSession = userSessions.some((s) => !s.isCompleted && s.status === 'ACTIVE');

    let participantStatus = 'Idle';
    if (!u.isActive) participantStatus = 'Disabled';
    else if (hasActiveSession) participantStatus = 'Active';
    else if (userSessions.some((s) => s.isCompleted) || solvedChallengeIds.size > 0) participantStatus = 'Completed';

    return {
      _id: u._id,
      participantId: `MC-${u._id.toString().slice(-4).toUpperCase()}`,
      name: u.name,
      email: u.email,
      college: u.college || 'Engineering Institute',
      teamName: u.teamName || u.name,
      challengesAttempted: userSessions.length || (userSubs.length > 0 ? 1 : 0),
      challengesCompleted: solvedChallengeIds.size,
      score: totalScore,
      submissionsCount: userSubs.length,
      acceptedCount,
      wrongCount,
      revealsCount: totalReveals,
      status: participantStatus,
      isActive: u.isActive,
      lastActive: userSessions[0]?.lastActivityAt || u.updatedAt,
    };
  });

  if (status && status !== 'All') {
    return res.json({ success: true, participants: participants.filter((p) => p.status === status) });
  }

  res.json({ success: true, participants });
});

exports.getParticipantById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Participant not found' });
  }

  const [submissions, sessions] = await Promise.all([
    Submission.find({ userId: user._id }).populate('challengeId', 'title difficulty points').sort({ createdAt: -1 }),
    ParticipantSession.find({ userId: user._id }).populate('challengeId', 'title duration').sort({ startTime: -1 }),
  ]);

  const acceptedCount = submissions.filter((s) => s.status === 'ACCEPTED').length;
  const totalScore = submissions.reduce((acc, s) => acc + (s.score || (s.status === 'ACCEPTED' ? 100 : 0)), 0);
  const revealsUsed = sessions.reduce((acc, s) => acc + (s.revealsCount || 0), 0);

  res.json({
    success: true,
    participant: {
      ...user.toObject(),
      participantId: `MC-${user._id.toString().slice(-4).toUpperCase()}`,
      stats: {
        totalScore,
        acceptedCount,
        submissionsCount: submissions.length,
        revealsUsed,
        accuracy: submissions.length > 0 ? `${Math.round((acceptedCount / submissions.length) * 100)}%` : '0%',
      },
      submissions,
      sessions,
    },
  });
});

exports.toggleParticipantStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Participant not found' });
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, isActive: user.isActive });
});

exports.resetParticipant = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  await Promise.all([
    Submission.deleteMany({ userId }),
    ParticipantSession.deleteMany({ userId }),
  ]);
  res.json({ success: true, message: 'Participant session and submission progress reset successfully' });
});

/**
 * SESSION MANAGEMENT
 */
exports.getSessions = asyncHandler(async (req, res) => {
  const sessions = await ParticipantSession.find()
    .populate('userId', 'name email teamName college')
    .populate('challengeId', 'title difficulty points duration timeLimitSeconds')
    .sort({ lastActivityAt: -1 });

  const enriched = sessions.map((s) => {
    const elapsed = Math.round((Date.now() - new Date(s.startTime).getTime()) / 1000);
    const duration = s.durationSeconds || 1200;
    const remaining = Math.max(0, duration - elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;

    return {
      _id: s._id,
      participant: s.userId?.name || 'Anonymous',
      email: s.userId?.email || 'N/A',
      college: s.userId?.college || 'N/A',
      challenge: s.challengeId?.title || 'Unknown',
      currentScore: s.scoreAwarded || 0,
      timeRemaining: s.isCompleted ? '00:00' : `${mins}:${String(secs).padStart(2, '0')}`,
      blocksRevealed: s.revealsCount || 0,
      currentBlockCount: (s.revealedBlockIds || []).length,
      status: s.status || (s.isCompleted ? 'COMPLETED' : 'ACTIVE'),
      isCompleted: s.isCompleted,
      lastActivityAt: s.lastActivityAt || s.updatedAt,
      startTime: s.startTime,
    };
  });

  res.json({ success: true, sessions: enriched });
});

exports.endSession = asyncHandler(async (req, res) => {
  const session = await ParticipantSession.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  session.isCompleted = true;
  session.status = 'COMPLETED';
  session.endTime = new Date();
  await session.save();

  res.json({ success: true, message: 'Session terminated', session });
});

exports.extendSession = asyncHandler(async (req, res) => {
  const { minutes = 5 } = req.body;
  const session = await ParticipantSession.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  session.durationSeconds = (session.durationSeconds || 1200) + Number(minutes) * 60;
  session.isCompleted = false;
  session.status = 'ACTIVE';
  await session.save();

  res.json({ success: true, message: `Session extended by ${minutes} minutes`, session });
});

exports.resetSession = asyncHandler(async (req, res) => {
  const session = await ParticipantSession.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, message: 'Session not found' });
  }

  session.scannedBlocks = [];
  session.revealedBlockIds = [];
  session.revealsCount = 0;
  session.scoreAwarded = 0;
  session.penaltyCount = 0;
  session.wrongAttemptsCount = 0;
  session.startTime = new Date();
  session.endTime = null;
  session.isCompleted = false;
  session.status = 'ACTIVE';
  await session.save();

  res.json({ success: true, message: 'Session reset successfully', session });
});

/**
 * SUBMISSION AUDIT & MANAGEMENT
 */
exports.getSubmissions = asyncHandler(async (req, res) => {
  const { status, challengeId, participantId, language } = req.query;
  const filter = {};

  if (status && status !== 'All') filter.status = status;
  if (challengeId && challengeId !== 'All') filter.challengeId = challengeId;
  if (participantId && participantId !== 'All') filter.userId = participantId;
  if (language && language !== 'All') filter.language = language;

  const submissions = await Submission.find(filter)
    .populate('userId', 'name email')
    .populate('challengeId', 'title slug points')
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ success: true, submissions });
});

exports.getSubmissionById = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('challengeId');

  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found' });
  }

  // Fetch expected blocks for comparison
  const expectedBlocks = await QRBlock.find({ challengeId: submission.challengeId?._id }).sort({ originalOrder: 1 });

  res.json({
    success: true,
    submission: {
      ...submission.toObject(),
      expectedBlocks: expectedBlocks.map((b) => ({
        blockId: b.blockId,
        originalOrder: b.originalOrder,
        code: b.codeSnippet,
      })),
    },
  });
});

/**
 * LEADERBOARD
 */
exports.getLeaderboard = asyncHandler(async (req, res) => {
  const rankings = await getLeaderboardData();
  res.json({ success: true, rankings });
});

/**
 * EXPORT EXCEL & PDF
 */
exports.exportExcel = asyncHandler(async (req, res) => {
  const buffer = await generateExcelReport();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `blind-coding-results-${dateStr}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

exports.exportPdf = asyncHandler(async (req, res) => {
  const buffer = await generatePdfReport();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `blind-coding-results-${dateStr}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});

/**
 * GLOBAL SETTINGS
 */
exports.getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json({ success: true, settings });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.json({ success: true, message: 'Competition settings updated successfully', settings });
});
