const asyncHandler = require('../utils/asyncHandler');
const ParticipantSession = require('../models/ParticipantSession');

exports.getUserSessions = asyncHandler(async (req, res) => {
  const sessions = await ParticipantSession.find({ userId: req.user._id }).populate('challengeId');
  res.json({ success: true, sessions });
});
