import { checkFragmentOrder } from '../utils/assembly';

/**
 * Mock Judge — used when VITE_USE_MOCK_JUDGE=true or backend is unreachable.
 * Correctness determined by fragment-id ordering. 1.8 s simulated delay.
 * NOTE: production must validate server-side via real Judge0 execution.
 */
export async function judgeSubmission({
  language = 'python',
  sourceCode = '',
  challenge = null,
  assemblyOrder = [],      // fragment objects in board order
  langFragments = [],      // langConfig.fragments (correct order)
  acceptedOrders = [],
}) {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const placedIds = assemblyOrder.map((f) => f.id);
  const canonicalIds = langFragments.map((f) => f.id);
  const check = checkFragmentOrder(placedIds, canonicalIds, acceptedOrders);

  const hiddenTests = challenge?.hiddenTests || [
    { id: 1, description: 'Sample validation' },
    { id: 2, description: 'Edge case validation' },
    { id: 3, description: 'Upper bound validation' },
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

  const testResults = hiddenTests.map((t, idx) => ({
    id: t.id,
    description: t.description || `Test Case #${t.id}`,
    status: idx === 0 && placedIds.length > 2 ? 'FAILED (Output Mismatch)' : 'FAILED (Order Error)',
    time: '0.02s',
    memory: '8.0 MB',
  }));

  return {
    status: 'WRONG_ANSWER',
    title: '❌ WRONG ANSWER',
    message: check.reason || 'Some hidden test cases failed. Re-evaluate your fragment arrangement.',
    testResults,
    passedCount: 0,
    totalCount: testResults.length,
    executionTime: '0.02s',
    memory: '8.0 MB',
  };
}
