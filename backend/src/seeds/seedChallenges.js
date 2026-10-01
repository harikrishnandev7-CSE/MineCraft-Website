const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const QRBlock = require('../models/QRBlock');
const TestCase = require('../models/TestCase');
const env = require('../config/env');

const seedChallenges = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    let chal = await Challenge.findOne({ slug: 'matrix-cipher' });
    if (!chal) {
      chal = await Challenge.create({
        title: 'The Matrix Cipher',
        slug: 'matrix-cipher',
        category: 'Algorithms',
        difficulty: 'Medium',
        points: 150,
        description: 'Decode the stream of intercepted letters using interleaved shifts.',
        inputFormat: 'N\nEncoded string',
        outputFormat: 'Decoded string',
        constraints: '1 <= N <= 10^5',
      });

      await QRBlock.create([
        { challengeId: chal._id, orderHint: 1, blockType: 'FUNCTION', codeSnippet: 'def decrypt_stream(n, s):\n    res = []', qrHash: 'hash_block_1' },
        { challengeId: chal._id, orderHint: 2, blockType: 'LOGIC', codeSnippet: '    for i, ch in enumerate(s):\n        res.append(chr((ord(ch) - 97 - (i % 3)) % 26 + 97))', qrHash: 'hash_block_2' },
        { challengeId: chal._id, orderHint: 3, blockType: 'OUTPUT', codeSnippet: '    return "".join(res)\n\nif __name__ == "__main__":\n    print(decrypt_stream(5, "bcdfg"))', qrHash: 'hash_block_3' },
      ]);

      await TestCase.create([
        { challengeId: chal._id, input: '5\nbcdfg', expectedOutput: 'abcde', isHidden: false, weight: 50 },
        { challengeId: chal._id, input: '3\nxyz', expectedOutput: 'xwy', isHidden: true, weight: 50 },
      ]);

      console.log('Sample challenge seeded successfully');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed Challenges Error:', err);
  }
};

if (require.main === module) {
  seedChallenges();
}

module.exports = seedChallenges;
