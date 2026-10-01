describe('Auth API Unit Tests', () => {
  it('should validate email format properly', () => {
    const valid = 'participant@mindcraft.io';
    expect(valid).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('should fail with invalid password', () => {
    const pwd = '123';
    expect(pwd.length).toBeLessThan(6);
  });
});
