const ParticipantSession = require('../../models/ParticipantSession');

exports.getOrCreateSession = async (userId, challengeId) => {
  let session = await ParticipantSession.findOne({ userId, challengeId });
  if (!session) {
    session = await ParticipantSession.create({ userId, challengeId, scannedBlocks: [] });
  }
  return session;
};
