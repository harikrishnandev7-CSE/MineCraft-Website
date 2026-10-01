import { describe, it, expect } from 'vitest';

describe('Timer Formatting Tests', () => {
  it('formats seconds into MM:SS correctly', () => {
    const sec = 125;
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    expect(formatted).toBe('02:05');
  });
});
