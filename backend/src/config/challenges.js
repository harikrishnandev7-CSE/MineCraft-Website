const CHALLENGE_TEST_CASES = {
  'ch-01': [
    { id: 1, input: '5\n', expectedOutput: '15' },
    { id: 2, input: '10\n', expectedOutput: '55' },
    { id: 3, input: '20\n', expectedOutput: '210' },
  ],
  'ch-02': [
    { id: 1, input: 'mindcraft\n', expectedOutput: 'tfardcnim' },
    { id: 2, input: 'racecar\n', expectedOutput: 'racecar' },
    { id: 3, input: 'algorithm\n', expectedOutput: 'mihtirogla' },
  ],
  'ch-03': [
    { id: 1, input: '10 45 2 99 31\n', expectedOutput: '99' },
    { id: 2, input: '-5 -1 -20 -3\n', expectedOutput: '-1' },
    { id: 3, input: '100 200 50 400 150\n', expectedOutput: '400' },
  ],
};

module.exports = {
  CHALLENGE_TEST_CASES,
  getHiddenTests: (challengeId) => CHALLENGE_TEST_CASES[challengeId] || CHALLENGE_TEST_CASES['ch-01'],
};
