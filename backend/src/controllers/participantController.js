const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Event = require('../models/Event');
const generateToken = require('../utils/generateToken');

exports.registerParticipant = asyncHandler(async (req, res) => {
  const { name, email: reqEmail, password, teamName, sessionCode, college } = req.body;

  let event = null;
  if (sessionCode) {
    event = await Event.findOne({ sessionCode: sessionCode.toUpperCase() });
  }

  const displayName = name || teamName || 'Contestant';
  const email = reqEmail || `${displayName.toLowerCase().replace(/\s+/g, '')}_${Date.now()}@arena.local`;
  const pwd = password || 'guest_participant_pwd';

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: displayName,
      email,
      password: pwd,
      role: 'participant',
      teamName: teamName || displayName,
      college: college || 'Engineering Institute',
      eventId: event?._id,
    });
  }

  res.status(201).json({
    success: true,
    token: generateToken(user._id, 'participant'),
    user: { id: user._id, name: user.name, email: user.email, teamName: user.teamName, role: 'participant' },
  });
});

exports.getStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, status: 'ACTIVE', team: req.user?.teamName });
});
