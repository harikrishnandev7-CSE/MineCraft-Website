import { combineFragments, checkFragmentOrder } from '../utils/assembly';

/**
 * Mock Compiler — used when VITE_USE_MOCK_JUDGE=true or backend is unreachable.
 * Delays simulate realistic compile + run latency (1.4–1.8 s).
 * Correctness is assessed by fragment-id ordering, NOT real execution.
 */
export async function runCode({
  language = 'python',
  sourceCode = '',
  input = '',
  challenge = null,
  assemblyOrder = [],      // array of fragment objects in board order
  langFragments = [],      // langConfig.fragments (correct order array)
  acceptedOrders = [],
}) {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  if (!sourceCode.trim()) {
    return {
      status: 'compilation_error',
      stdout: '',
      stderr: 'Error: Empty source file. No assembled fragments to execute.',
      compileOutput: 'Fatal: Compiler received zero executable tokens.',
      executionTime: '0.00s',
      memory: '0.0 MB',
    };
  }

  const placedIds = assemblyOrder.map((f) => f.id);
  const canonicalIds = langFragments.map((f) => f.id);
  const check = checkFragmentOrder(placedIds, canonicalIds, acceptedOrders);

  if (!check.isCorrect) {
    return {
      status: 'compilation_error',
      stdout: '',
      stderr: `SyntaxError / Logic Error: ${check.reason}\n  Tip: Ensure imports come first, declarations before loops, and output last.`,
      compileOutput: 'Compilation terminated (Logical Sequence Error).',
      executionTime: '0.01s',
      memory: '4.2 MB',
    };
  }

  const stdout = challenge?.sampleOutput ?? 'Program executed successfully.';
  return {
    status: 'success',
    stdout,
    stderr: '',
    compileOutput: `Compilation successful.\nEngine: Mock (set VITE_USE_MOCK_JUDGE=false for real execution).`,
    executionTime: '0.04s',
    memory: '12.4 MB',
  };
}
