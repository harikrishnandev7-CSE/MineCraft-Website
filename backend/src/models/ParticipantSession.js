const mongoose = require('mongoose');

const participantSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    scannedBlocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QRBlock' }],
    revealedBlockIds: [{ type: String }],
    revealsCount: { type: Number, default: 0 },
    revealEvents: [
      {
        taskId: { type: String },
        blockId: { type: String },
        penalty: { type: Number, default: 5 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    durationSeconds: { type: Number, default: 1200 },
    isCompleted: { type: Boolean, default: false },
    scoreAwarded: { type: Number, default: 0 },
    penaltyCount: { type: Number, default: 0 },
    wrongAttemptsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'IDLE', 'COMPLETED', 'DISCONNECTED', 'SUSPICIOUS'],
      default: 'ACTIVE',
    },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParticipantSession', participantSessionSchema);
