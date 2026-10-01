const asyncHandler = require('../utils/asyncHandler');
const Challenge = require('../models/Challenge');

exports.getChallenges = asyncHandler(async (req, res) => {
  const challenges = await Challenge.find({ isActive: true });
  res.json({ success: true, challenges });
});

exports.getChallengeById = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) {
    return res.status(404).json({ success: false, message: 'Challenge not found' });
  }
  res.json({ success: true, challenge });
});

exports.getActiveChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findOne({ isActive: true });
  res.json({ success: true, challenge });
});
