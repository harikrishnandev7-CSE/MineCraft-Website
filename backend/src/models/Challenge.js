const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, default: 'Algorithms' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    points: { type: Number, default: 100 },
    description: { type: String, required: true },
    instructions: { type: String, default: 'Arrange the revealed code blocks in the correct logical execution order.' },
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    constraints: { type: String, default: '' },
    timeLimitSeconds: { type: Number, default: 1200 }, // 20 minutes default
    maxAttempts: { type: Number, default: 5 },
    supportedLanguages: [{ type: String, default: ['java', 'python', 'cpp', 'c', 'javascript'] }],
    sourceLanguage: { type: String, default: 'java' },
    sourceCode: { type: String, default: '' }, // Admin solution - never exposed to participants
    splitStrategy: { type: String, enum: ['statement', 'line', 'function', 'custom'], default: 'statement' },
    status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Published' },
    isActive: { type: Boolean, default: true },
    sampleInput: { type: String, default: '' },
    tasks: [
      {
        taskId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        requiredBlockIds: [{ type: String }],
        penalty: { type: Number, default: 5 },
        order: { type: Number, default: 1 },
      },
    ],
    blockConfig: {
      totalBlocks: { type: Number, default: 0 },
      initialVisibleCount: { type: Number, default: 3 },
      revealMode: { type: String, enum: ['manual', 'sequential', 'timer', 'token', 'task'], default: 'task' },
      revealPenalty: { type: Number, default: 5 },
      wrongSubmissionPenalty: { type: Number, default: 2 },
      maxReveals: { type: Number, default: 10 },
      randomizeOrder: { type: Boolean, default: true },
      allowDuplicateReveal: { type: Boolean, default: false },
      partialScoring: { type: Boolean, default: true },
      timeBonus: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Keep isActive in sync with status
challengeSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.isActive = this.status === 'Published';
  }
  next();
});

module.exports = mongoose.model('Challenge', challengeSchema);
