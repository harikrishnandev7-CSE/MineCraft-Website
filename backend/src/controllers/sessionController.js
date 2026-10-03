const asyncHandler = require('../utils/asyncHandler');
const ParticipantSession = require('../models/ParticipantSession');
const Challenge = require('../models/Challenge');

exports.getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await ParticipantSession.find({ userId: req.user._id }).lean();
  const enriched = await Promise.all(
    sessions.map(async (sess) => {
      if (sess.challengeId && /^[0-9a-fA-F]{24}$/.test(String(sess.challengeId))) {
        const chal = await Challenge.findById(sess.challengeId).select('title duration').lean();
        return { ...sess, challengeId: chal || sess.challengeId };
      }
      return sess;
    })
  );
  res.json({ success: true, sessions: enriched });
});
