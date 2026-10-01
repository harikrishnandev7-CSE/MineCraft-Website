exports.validateQRSignature = (qrPayload, expectedChallengeId) => {
  if (!qrPayload || !qrPayload.hash) return false;
  if (expectedChallengeId && qrPayload.challengeId !== expectedChallengeId) return false;
  return true;
};
