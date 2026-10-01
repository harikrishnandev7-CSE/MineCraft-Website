const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    weight: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestCase', testCaseSchema);
