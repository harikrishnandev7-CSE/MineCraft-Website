const mongoose = require('mongoose');

const participantSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    scannedBlocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QRBlock' }],
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    isCompleted: { type: Boolean, default: false },
    scoreAwarded: { type: Number, default: 0 },
    penaltyCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParticipantSession', participantSessionSchema);
