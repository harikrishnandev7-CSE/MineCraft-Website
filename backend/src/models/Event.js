const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sessionCode: { type: String, required: true, unique: true, uppercase: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
