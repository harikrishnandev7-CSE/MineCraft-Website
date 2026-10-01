/**
 * CLI utility to generate printable QR code images for challenge blocks.
 * Usage: node scripts/generate-qr.js <challengeId>
 */
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

async function generateQRImages(challengeId = 'demo-challenge') {
  const outputDir = path.join(__dirname, '../dist-qr', challengeId);
  fs.mkdirSync(outputDir, { recursive: true });

  const dummyBlocks = [
    { order: 1, hash: `${challengeId}_block_1`, snippet: 'def solution():' },
    { order: 2, hash: `${challengeId}_block_2`, snippet: '    return 42' },
  ];

  for (const block of dummyBlocks) {
    const filePath = path.join(outputDir, `block_${block.order}.png`);
    await QRCode.toFile(filePath, block.hash);
    console.log(`Generated QR for Block #${block.order} -> ${filePath}`);
  }
}

if (require.main === module) {
  generateQRImages(process.argv[2] || 'matrix-cipher');
}

module.exports = generateQRImages;
