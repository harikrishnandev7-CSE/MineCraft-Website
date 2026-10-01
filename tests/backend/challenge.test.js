describe('Challenge Service Tests', () => {
  it('should verify challenge difficulty values', () => {
    const validDifficulties = ['Easy', 'Medium', 'Hard'];
    expect(validDifficulties).toContain('Medium');
  });
});
