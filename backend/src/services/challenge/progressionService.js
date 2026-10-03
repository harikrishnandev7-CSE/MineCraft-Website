const Challenge = require('../../models/Challenge');
const Submission = require('../../models/Submission');
const Settings = require('../../models/Settings');

/**
 * Returns numeric tier for a given difficulty.
 * Tier order: Easy (1) < Medium (2) < Hard (3)
 */
function getTier(difficulty) {
  switch (String(difficulty || '').toLowerCase()) {
    case 'easy':
      return 1;
    case 'medium':
      return 2;
    case 'hard':
      return 3;
    default:
      return 1;
  }
}

/**
 * Resolves a challenge document from an ObjectId string, slug, or document
 */
async function resolveChallenge(idOrDoc) {
  if (!idOrDoc) return null;
  if (typeof idOrDoc === 'object' && (idOrDoc.difficulty || idOrDoc.title)) {
    return idOrDoc;
  }
  const str = String(idOrDoc);
  if (/^[0-9a-fA-F]{24}$/.test(str)) {
    const c = await Challenge.findById(str).lean();
    if (c) return c;
  }
  return await Challenge.findOne({
    $or: [{ slug: str }, { slug: str.toLowerCase() }],
  }).lean();
}

/**
 * Computes challenge progression for a given user.
 * Single query for accepted submissions, single query for published challenges.
 */
async function getProgressForUser(userId, userObj = null) {
  const settings = await Settings.findOne().lean();
  const enforceProgression = settings?.enforceProgression !== false;
  const isAdmin = userObj?.role === 'admin';

  // 1. Fetch published challenges
  const challenges = await Challenge.find({ isActive: true, status: 'Published' })
    .select('_id slug title difficulty points timeLimitSeconds category')
    .sort({ difficulty: 1, createdAt: 1 })
    .lean();

  // 2. Fetch accepted submissions for user (if user is provided)
  const acceptedIds = new Set();
  if (userId) {
    const acceptedSubs = await Submission.find({
      userId,
      status: 'ACCEPTED',
    })
      .select('challengeId')
      .lean();

    acceptedSubs.forEach((sub) => {
      if (sub.challengeId) {
        acceptedIds.add(String(sub.challengeId).toLowerCase());
      }
    });
  }

  // 3. Group challenges by tier
  const tierMap = { 1: [], 2: [], 3: [] };
  challenges.forEach((c) => {
    const t = getTier(c.difficulty);
    if (!tierMap[t]) tierMap[t] = [];
    tierMap[t].push(c);
  });

  const availableTiers = [1, 2, 3].filter((t) => tierMap[t] && tierMap[t].length > 0);

  // Check which tiers are completed / unlocked
  const tierCompleted = {};
  availableTiers.forEach((t) => {
    const items = tierMap[t];
    const allAccepted = items.every((c) => {
      const idMatch = acceptedIds.has(String(c._id).toLowerCase());
      const slugMatch = c.slug && acceptedIds.has(String(c.slug).toLowerCase());
      return idMatch || slugMatch;
    });
    tierCompleted[t] = allAccepted;
  });

  // Calculate unlock status per tier
  const tierUnlocked = { 1: true, 2: false, 3: false };
  const tierRequiredTitles = { 1: [], 2: [], 3: [] };

  if (!enforceProgression || isAdmin) {
    tierUnlocked[1] = true;
    tierUnlocked[2] = true;
    tierUnlocked[3] = true;
  } else {
    // Tier 1 (Easy) is always unlocked
    tierUnlocked[1] = true;

    // For higher tiers, prerequisite is the nearest lower tier with published challenges
    availableTiers.forEach((t) => {
      if (t === 1) return;
      const lowerTiers = availableTiers.filter((lt) => lt < t);
      if (lowerTiers.length === 0) {
        tierUnlocked[t] = true;
      } else {
        const prereqTier = Math.max(...lowerTiers);
        const prereqChallenges = tierMap[prereqTier] || [];
        const missing = prereqChallenges.filter((c) => {
          const idMatch = acceptedIds.has(String(c._id).toLowerCase());
          const slugMatch = c.slug && acceptedIds.has(String(c.slug).toLowerCase());
          return !idMatch && !slugMatch;
        });

        if (missing.length === 0) {
          tierUnlocked[t] = true;
        } else {
          tierUnlocked[t] = false;
          tierRequiredTitles[t] = missing.map((c) => c.title);
        }
      }
    });
  }

  // 4. Build output progress objects
  const progress = challenges.map((c) => {
    const tier = getTier(c.difficulty);
    const isCompleted =
      acceptedIds.has(String(c._id).toLowerCase()) ||
      (c.slug && acceptedIds.has(String(c.slug).toLowerCase()));

    let status = 'UNLOCKED';
    let lockedReason = '';
    let requiredTitles = [];

    if (isCompleted) {
      status = 'COMPLETED';
    } else if (enforceProgression && !isAdmin && !tierUnlocked[tier]) {
      status = 'LOCKED';
      requiredTitles = tierRequiredTitles[tier] || [];
      const reqName = requiredTitles.length > 0 ? requiredTitles[0] : (tier === 3 ? 'Medium challenge' : 'Easy challenge');
      lockedReason = `Complete "${reqName}" first to unlock this challenge.`;
    }

    return {
      challengeId: c._id,
      slug: c.slug,
      title: c.title,
      difficulty: c.difficulty,
      tier,
      status, // 'LOCKED' | 'UNLOCKED' | 'COMPLETED'
      lockedReason,
      requiredChallengeTitles: requiredTitles,
    };
  });

  return {
    progress,
    enforceProgression,
  };
}

/**
 * Asserts whether a challenge is unlocked for a given user.
 * Returns { unlocked: boolean, message?: string, requiredChallengeTitles?: string[] }
 */
async function assertChallengeUnlocked(user, idOrDoc) {
  // Admins bypass all locks
  if (user?.role === 'admin') {
    return { unlocked: true };
  }

  const challenge = await resolveChallenge(idOrDoc);
  if (!challenge) {
    return { unlocked: true };
  }

  const tier = getTier(challenge.difficulty);
  if (tier <= 1) {
    return { unlocked: true };
  }

  // Check global setting
  const settings = await Settings.findOne().lean();
  if (settings?.enforceProgression === false) {
    return { unlocked: true };
  }

  if (!user || !user._id) {
    return {
      unlocked: false,
      code: 'CHALLENGE_LOCKED',
      message: 'Registration required. Please register and complete earlier challenges first.',
      requiredChallengeTitles: [],
    };
  }

  const { progress } = await getProgressForUser(user._id, user);
  const targetId = String(challenge._id || '').toLowerCase();
  const targetSlug = String(challenge.slug || '').toLowerCase();

  const item = progress.find(
    (p) =>
      String(p.challengeId).toLowerCase() === targetId ||
      String(p.slug).toLowerCase() === targetSlug
  );

  if (item && item.status === 'LOCKED') {
    return {
      unlocked: false,
      code: 'CHALLENGE_LOCKED',
      message: item.lockedReason || 'This challenge is locked.',
      requiredChallengeTitles: item.requiredChallengeTitles || [],
    };
  }

  return { unlocked: true };
}

/**
 * Reusable helper for Express controller endpoints.
 * If challenge is locked, responds with 403 and returns false.
 * Otherwise returns true.
 */
async function checkChallengeLock(req, res, idOrDoc) {
  const check = await assertChallengeUnlocked(req.user, idOrDoc);
  if (!check.unlocked) {
    res.status(403).json({
      success: false,
      code: 'CHALLENGE_LOCKED',
      message: check.message,
      requiredChallengeTitles: check.requiredChallengeTitles || [],
    });
    return false;
  }
  return true;
}

module.exports = {
  getTier,
  getProgressForUser,
  assertChallengeUnlocked,
  checkChallengeLock,
};
