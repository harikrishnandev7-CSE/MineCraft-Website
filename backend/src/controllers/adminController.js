const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Submission = require('../models/Submission');
const ParticipantSession = require('../models/ParticipantSession');

exports.getOverview = asyncHandler(async (req, res) => {
  const [totalParticipants, totalChallenges, totalSubmissions, activeSessions] = await Promise.all([
    User.countDocuments({ role: 'participant' }),
    Challenge.countDocuments(),
    Submission.countDocuments(),
    ParticipantSession.countDocuments({ isCompleted: false }),
  ]);

  res.json({
    success: true,
    stats: { totalParticipants, totalChallenges, totalSubmissions, activeSessions },
  });
});

exports.getParticipants = asyncHandler(async (req, res) => {
  const participants = await User.find({ role: 'participant' });
  res.json({ success: true, participants });
});

exports.createChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.create(req.body);
  res.status(201).json({ success: true, challenge });
});

exports.updateChallenge = asyncHandler(async (req, res) => {
  const challenge = await Challenge.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, challenge });
});

exports.getSessions = asyncHandler(async (req, res) => {
  const sessions = await ParticipantSession.find().populate('userId challengeId');
  res.json({ success: true, sessions });
});

exports.getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find().populate('userId challengeId').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, submissions });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Settings saved', settings: req.body });
});
