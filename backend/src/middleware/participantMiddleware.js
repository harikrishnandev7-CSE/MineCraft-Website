const requireParticipant = (req, res, next) => {
  if (req.user && (req.user.role === 'participant' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Participant access required' });
  }
};

module.exports = requireParticipant;
