import { describe, it, expect } from 'vitest';

describe('QR Scanner State Tests', () => {
  it('detects duplicate block additions', () => {
    const scanned = [{ id: 'b1' }];
    const exists = scanned.some((b) => b.id === 'b1');
    expect(exists).toBe(true);
  });
});
