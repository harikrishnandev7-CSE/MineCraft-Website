describe('Judging Output Normalization Tests', () => {
  it('should strip carriage returns and trim', () => {
    const raw = 'Hello World!\r\n  ';
    const normalized = raw.replace(/\r\n/g, '\n').trim();
    expect(normalized).toBe('Hello World!');
  });
});
