const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, teamName: user.teamName },
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
});

exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' });

  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      token: generateToken(user._id, 'admin'),
      user: { id: user._id, name: user.name, email: user.email, role: 'admin' },
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});
