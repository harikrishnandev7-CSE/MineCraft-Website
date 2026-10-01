import { checkAssemblyAccuracy } from '../utils/assembly';

/**
 * Frontend Mock Compiler
 * Simulates real compilation and execution with realistic 1.2 - 1.8s delay.
 */
export async function runCode({
  language = 'python',
  sourceCode = '',
  input = '',
  challenge = null,
  placedBlocks = [],
  targetBlocks = [],
}) {
  // Realistic compilation & execution delay
  await new Promise((resolve) => setTimeout(resolve, 1400));

  if (!sourceCode.trim()) {
    return {
      status: 'compilation_error',
      stdout: '',
      stderr: 'Error: Empty source file. No assembled instructions to execute.',
      compileOutput: 'Fatal: Compiler received zero executable tokens.',
      executionTime: '0.00s',
      memory: '0.0 MB',
    };
  }

  // Evaluate the assembly order
  const check = checkAssemblyAccuracy(placedBlocks, targetBlocks);

  if (!check.isCorrect) {
    if (check.hasDecoy) {
      return {
        status: 'runtime_error',
        stdout: '',
        stderr: `Runtime Exception: Traceback (most recent call last):\n  File "solution.${language}", line 4, in <module>\n    ${check.reason}`,
        compileOutput: 'Execution aborted due to illegal instruction.',
        executionTime: '0.02s',
        memory: '8.4 MB',
      };
    }

    return {
      status: 'compilation_error',
      stdout: '',
      stderr: `SyntaxError: Logical sequence breakdown.\n  --> ${check.reason}\n  Tip: Ensure variable declarations precede loops and outputs.`,
      compileOutput: 'Compilation terminated with exit code 1 (Syntax / Sequence Error).',
      executionTime: '0.01s',
      memory: '4.2 MB',
    };
  }

  // Correct assembly -> Return expected sample output!
  const stdout = challenge ? challenge.sampleOutput : 'Program executed successfully.';
  return {
    status: 'success',
    stdout: stdout,
    stderr: '',
    compileOutput: 'Compilation successful without warnings.\nBinary built target: x86_64-linux-gnu.',
    executionTime: '0.04s',
    memory: '12.4 MB',
  };
}
