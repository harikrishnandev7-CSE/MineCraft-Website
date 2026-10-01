const crypto = require('crypto');

exports.generateQRHash = (challengeId, orderHint) => {
  return crypto.createHash('sha256').update(`${challengeId}-${orderHint}-${Date.now()}`).digest('hex').substring(0, 16);
};
