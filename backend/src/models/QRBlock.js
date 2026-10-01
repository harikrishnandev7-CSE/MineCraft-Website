const mongoose = require('mongoose');

const qrBlockSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    codeSnippet: { type: String, required: true },
    qrHash: { type: String, required: true, unique: true },
    orderHint: { type: Number, required: true },
    blockType: { type: String, enum: ['IMPORT', 'FUNCTION', 'LOGIC', 'WRAPPER', 'OUTPUT'], default: 'LOGIC' },
    language: { type: String, required: true, default: 'python' },
    locationHint: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QRBlock', qrBlockSchema);
