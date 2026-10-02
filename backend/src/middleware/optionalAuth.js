const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    // If token is invalid or expired, continue as guest
    req.user = null;
  }
  next();
};

module.exports = optionalAuth;
