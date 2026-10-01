import { describe, it, expect } from 'vitest';

describe('Editor Line Counting Tests', () => {
  it('counts code lines correctly', () => {
    const code = "line 1\nline 2\nline 3";
    expect(code.split('\n').length).toBe(3);
  });
});
