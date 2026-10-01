const QRBlock = require('../../models/QRBlock');

exports.getBlocksForChallenge = async (challengeId) => {
  return QRBlock.find({ challengeId }).sort({ orderHint: 1 });
};
