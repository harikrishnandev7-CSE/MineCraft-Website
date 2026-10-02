const asyncHandler = require('../utils/asyncHandler');
const Challenge = require('../models/Challenge');
const QRBlock = require('../models/QRBlock');
const TestCase = require('../models/TestCase');
const ParticipantSession = require('../models/ParticipantSession');

exports.getChallenges = asyncHandler(async (req, res) => {
  // Never expose sourceCode to participants
  const challenges = await Challenge.find({ isActive: true }).select('-sourceCode');
  res.json({ success: true, challenges });
});

exports.getChallengeById = asyncHandler(async (req, res) => {
  // Never expose sourceCode to participants
  const challenge = await Challenge.findById(req.params.id).select('-sourceCode');
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  // Include sample/visible test cases only
  const visibleTests = await TestCase.find({ challengeId: challenge._id, isHidden: false })
    .select('input expectedOutput weight description')
    .sort({ orderIndex: 1 });

  res.json({
    success: true,
    challenge: {
      ...challenge.toObject(),
      visibleTestCases: visibleTests,
      tasks: challenge.tasks || [],
    },
  });
});

exports.getActiveChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findOne({ isActive: true }).select('-sourceCode');
  res.json({ success: true, challenge });
});

/**
 * Get blocks for participant arena
 * SECURITY: Strips 'originalOrder' and only provides initially visible + revealed blocks
 */
exports.getParticipantBlocks = asyncHandler(async (req, res) => {
  const challengeId = req.params.id;
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  const allBlocks = await QRBlock.find({ challengeId }).sort({ displayOrder: 1 });

  // If user is authenticated, check their session
  let revealedIds = [];
  if (req.user) {
    const session = await ParticipantSession.findOne({ userId: req.user._id, challengeId });
    if (session) {
      revealedIds = session.revealedBlockIds || [];
    }
  }

  const initialCount = challenge.blockConfig?.initialVisibleCount || 3;

  // Filter blocks that are initially visible OR already unlocked/revealed
  const participantBlocks = allBlocks.map((block) => {
    const isInitiallyVisible = block.displayOrder <= initialCount || block.isInitiallyVisible;
    const isUnlocked = isInitiallyVisible || revealedIds.includes(block.blockId);

    return {
      blockId: block.blockId,
      code: isUnlocked ? block.codeSnippet : null, // Hide code if locked
      codeSnippet: isUnlocked ? block.codeSnippet : null,
      blockType: isUnlocked ? block.blockType : 'LOCKED',
      language: block.language,
      qrHash: block.qrHash,
      displayOrder: block.displayOrder,
      taskId: block.taskId,
      isUnlocked,
      isDecoy: isUnlocked ? block.isDecoy : false,
      hint: isUnlocked ? block.hint : 'Hidden Code Fragment - Complete task or click reveal to unlock',
      // DO NOT INCLUDE originalOrder
    };
  });

  res.json({
    success: true,
    blocks: participantBlocks,
    totalBlocks: allBlocks.length,
    unlockedCount: participantBlocks.filter((b) => b.isUnlocked).length,
    tasks: challenge.tasks || [],
  });
});

/**
 * Reveal next block for participant (supports task-based reveal)
 */
exports.revealBlock = asyncHandler(async (req, res) => {
  const challengeId = req.params.id;
  const { taskId, blockId: requestedBlockId } = req.body || {};

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }

  const allBlocks = await QRBlock.find({ challengeId }).sort({ displayOrder: 1 });
  const initialCount = challenge.blockConfig?.initialVisibleCount || 3;
  const maxReveals = challenge.blockConfig?.maxReveals || allBlocks.length;
  const revealPenalty = challenge.blockConfig?.revealPenalty !== undefined ? challenge.blockConfig.revealPenalty : 5;

  let session = null;
  if (req.user) {
    session = await ParticipantSession.findOne({ userId: req.user._id, challengeId });
    if (!session) {
      session = await ParticipantSession.create({
        userId: req.user._id,
        challengeId,
        revealedBlockIds: [],
        revealsCount: 0,
        revealEvents: [],
      });
    }
  }

  const currentReveals = session?.revealsCount || 0;
  if (currentReveals >= maxReveals) {
    return res.status(400).json({ success: false, message: 'Maximum reveals limit reached for this challenge' });
  }

  const alreadyRevealed = new Set(session?.revealedBlockIds || []);

  let targetBlock = null;

  // 1. Task-based reveal matching
  if (taskId) {
    const task = (challenge.tasks || []).find((t) => t.taskId === taskId);
    if (task && Array.isArray(task.requiredBlockIds) && task.requiredBlockIds.length > 0) {
      targetBlock = allBlocks.find((b) => task.requiredBlockIds.includes(b.blockId) && !alreadyRevealed.has(b.blockId));
    }
    if (!targetBlock) {
      targetBlock = allBlocks.find((b) => b.taskId === taskId && !alreadyRevealed.has(b.blockId));
    }
  }

  // 2. Specific blockId requested
  if (!targetBlock && requestedBlockId) {
    targetBlock = allBlocks.find((b) => b.blockId === requestedBlockId && !alreadyRevealed.has(b.blockId));
  }

  // 3. Fallback: Next locked block in displayOrder
  if (!targetBlock) {
    targetBlock = allBlocks.find((b) => b.displayOrder > initialCount && !alreadyRevealed.has(b.blockId));
  }

  if (!targetBlock) {
    return res.status(400).json({ success: false, message: 'All relevant blocks are already revealed' });
  }

  if (session) {
    session.revealedBlockIds.push(targetBlock.blockId);
    session.revealsCount += 1;
    session.penaltyCount = (session.penaltyCount || 0) + revealPenalty;
    if (!Array.isArray(session.revealEvents)) {
      session.revealEvents = [];
    }
    session.revealEvents.push({
      taskId: taskId || targetBlock.taskId || 'general',
      blockId: targetBlock.blockId,
      penalty: revealPenalty,
      timestamp: new Date(),
    });
    session.lastActivityAt = new Date();
    await session.save();
  }

  res.json({
    success: true,
    revealedBlock: {
      blockId: targetBlock.blockId,
      code: targetBlock.codeSnippet,
      codeSnippet: targetBlock.codeSnippet,
      blockType: targetBlock.blockType,
      language: targetBlock.language,
      qrHash: targetBlock.qrHash,
      displayOrder: targetBlock.displayOrder,
      taskId: targetBlock.taskId,
      isUnlocked: true,
      hint: targetBlock.hint,
    },
    revealsCount: (session?.revealsCount || 0),
    maxReveals,
    penalty: revealPenalty,
    taskId: taskId || targetBlock.taskId,
  });
});
