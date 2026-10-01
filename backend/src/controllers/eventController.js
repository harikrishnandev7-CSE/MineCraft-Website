const asyncHandler = require('../utils/asyncHandler');
const Event = require('../models/Event');

exports.getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().populate('challenges');
  res.json({ success: true, events });
});
