const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Event = require('../models/Event');
const generateToken = require('../utils/generateToken');

exports.registerParticipant = asyncHandler(async (req, res) => {
  const { teamName, sessionCode } = req.body;
  const event = await Event.findOne({ sessionCode: sessionCode.toUpperCase() });

  const email = `${teamName.toLowerCase().replace(/\s+/g, '')}_${Date.now()}@arena.local`;
  const user = await User.create({
    name: teamName,
    email,
    password: 'guest_participant_pwd',
    role: 'participant',
    teamName,
    eventId: event?._id,
  });

  res.status(201).json({
    success: true,
    token: generateToken(user._id, 'participant'),
    user: { id: user._id, name: user.name, teamName: user.teamName, role: 'participant' },
  });
});

exports.getStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, status: 'ACTIVE', team: req.user?.teamName });
});
