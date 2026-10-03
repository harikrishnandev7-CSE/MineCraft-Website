const CHALLENGE_TEST_CASES = {
  'ch-05': [
    { id: 1, input: '10 25 15\n', expectedOutput: '25' },
    { id: 2, input: '50 12 3\n', expectedOutput: '50' },
    { id: 3, input: '7 9 99\n', expectedOutput: '99' },
    { id: 4, input: '-15 -5 -30\n', expectedOutput: '-5' },
    { id: 5, input: '42 42 42\n', expectedOutput: '42' },
    { id: 6, input: '100 100 50\n', expectedOutput: '100' },
    { id: 7, input: '15 200 200\n', expectedOutput: '200' },
    { id: 8, input: '0 0 -1\n', expectedOutput: '0' },
  ],
};

module.exports = {
  CHALLENGE_TEST_CASES,
  getHiddenTests: (challengeId) => CHALLENGE_TEST_CASES[challengeId] || CHALLENGE_TEST_CASES['ch-05'],
};
