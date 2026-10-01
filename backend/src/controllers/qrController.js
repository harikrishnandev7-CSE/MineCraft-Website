const asyncHandler = require('../utils/asyncHandler');
const QRBlock = require('../models/QRBlock');
const ParticipantSession = require('../models/ParticipantSession');

exports.scanBlock = asyncHandler(async (req, res) => {
  const { qrCode, challengeId } = req.body;
  const block = await QRBlock.findOne({ qrHash: qrCode, challengeId });

  if (!block) {
    return res.status(404).json({ success: false, message: 'Invalid or unknown QR code' });
  }

  // Record into participant session
  if (req.user) {
    await ParticipantSession.findOneAndUpdate(
      { userId: req.user._id, challengeId },
      { $addToSet: { scannedBlocks: block._id } },
      { upsert: true }
    );
  }

  res.json({ success: true, block });
});

exports.getScannedBlocks = asyncHandler(async (req, res) => {
  const session = await ParticipantSession.findOne({
    userId: req.user?._id,
    challengeId: req.params.challengeId,
  }).populate('scannedBlocks');

  res.json({ success: true, blocks: session ? session.scannedBlocks : [] });
});
