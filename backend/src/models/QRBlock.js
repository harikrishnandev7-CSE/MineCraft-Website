const mongoose = require('mongoose');

const qrBlockSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.Mixed, required: true },
    blockId: { type: String, required: true }, // e.g. 'B01', 'B02'
    codeSnippet: { type: String, required: true },
    qrHash: { type: String, required: true, unique: true },
    originalOrder: { type: Number, required: true }, // Internal ground truth order
    displayOrder: { type: Number, required: true }, // Order presented to participant
    orderHint: { type: Number }, // Kept for backward compatibility
    blockType: {
      type: String,
      enum: ['IMPORT', 'FUNCTION', 'LOGIC', 'WRAPPER', 'OUTPUT', 'INIT', 'LOOP', 'DECOY', 'COMMENT', 'INPUT', 'MAIN_WRAPPER', 'DECLARATION'],
      default: 'LOGIC',
    },
    language: { type: String, required: true, default: 'java' },
    locationHint: { type: String },
    hint: { type: String, default: '' },
    points: { type: Number, default: 10 },
    isDecoy: { type: Boolean, default: false },
    isInitiallyVisible: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    taskId: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Virtual property 'code' pointing to codeSnippet
qrBlockSchema.virtual('code').get(function () {
  return this.codeSnippet;
});

qrBlockSchema.set('toJSON', { virtuals: true });
qrBlockSchema.set('toObject', { virtuals: true });

// Sync orderHint with originalOrder if not set
qrBlockSchema.pre('save', function (next) {
  if (this.originalOrder !== undefined && this.orderHint === undefined) {
    this.orderHint = this.originalOrder;
  }
  next();
});

module.exports = mongoose.model('QRBlock', qrBlockSchema);
