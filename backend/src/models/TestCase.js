const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    input: { type: String, default: '' },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    weight: { type: Number, default: 20 },
    timeoutSeconds: { type: Number, default: 5 },
    isEnabled: { type: Boolean, default: true },
    orderIndex: { type: Number, default: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestCase', testCaseSchema);
