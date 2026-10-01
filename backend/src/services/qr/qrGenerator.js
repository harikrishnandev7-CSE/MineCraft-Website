const QRCode = require('qrcode');
const { generateQRHash } = require('../../utils/hash');

exports.generateQRCodeImage = async (data) => {
  return QRCode.toDataURL(JSON.stringify(data));
};

exports.createBlockHash = (challengeId, orderHint) => {
  return generateQRHash(challengeId, orderHint);
};
