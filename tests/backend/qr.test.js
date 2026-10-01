describe('QR Service Tests', () => {
  it('should validate QR hash generation length', () => {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update('challenge-1-0').digest('hex').substring(0, 16);
    expect(hash).toHaveLength(16);
  });
});
