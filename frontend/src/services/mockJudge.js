import { checkAssemblyAccuracy } from '../utils/assembly';

/**
 * Frontend Mock Judge
 * Evaluates the assembled solution against 3 hidden test cases.
 */
export async function judgeSubmission({
  language = 'python',
  sourceCode = '',
  challenge = null,
  placedBlocks = [],
  targetBlocks = [],
}) {
  // Realistic validation pipeline delay (1.8s)
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const check = checkAssemblyAccuracy(placedBlocks, targetBlocks);
  const hiddenTests = challenge?.hiddenTests || [
    { id: 1, description: 'Sample validation' },
    { id: 2, description: 'Edge case validation' },
    { id: 3, description: 'High concurrency boundary' },
  ];

  if (check.isCorrect) {
    const testResults = hiddenTests.map((t) => ({
      id: t.id,
      description: t.description || `Test Case #${t.id}`,
      status: 'PASSED',
      time: '0.03s',
      memory: '14.1 MB',
    }));

    return {
      status: 'ACCEPTED',
      title: '🎉 ACCEPTED',
      message: 'All test cases passed successfully!',
      testResults,
      passedCount: testResults.length,
      totalCount: testResults.length,
      executionTime: '0.04s',
      memory: '12.8 MB',
    };
  }

  // Failed assembly -> Generate realistic partial or total test failure
  const testResults = hiddenTests.map((t, idx) => ({
    id: t.id,
    description: t.description || `Test Case #${t.id}`,
    status: idx === 0 && placedBlocks.length > 2 ? 'FAILED (Output Mismatch)' : 'FAILED (Logical Order Error)',
    time: '0.02s',
    memory: '8.0 MB',
  }));

  return {
    status: 'WRONG_ANSWER',
    title: '❌ WRONG ANSWER',
    message: check.reason || 'Some hidden test cases failed. Re-evaluate your block arrangement.',
    testResults,
    passedCount: 0,
    totalCount: testResults.length,
    executionTime: '0.02s',
    memory: '8.0 MB',
  };
}
