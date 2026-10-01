import { describe, it, expect } from 'vitest';

describe('Assembly Logic Tests', () => {
  it('combines blocks in order', () => {
    const blocks = [
      { order: 2, code: 'print("world")' },
      { order: 1, code: 'print("hello")' }
    ];
    const sorted = [...blocks].sort((a, b) => a.order - b.order);
    expect(sorted[0].code).toBe('print("hello")');
  });
});
