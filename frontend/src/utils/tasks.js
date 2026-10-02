/**
 * Task generation and verification helper for Mind Craft code blocks.
 * Associates each code block with an assigned admin task and validation question.
 */

export function getBlockTask(block, challenge = null, language = 'python') {
  if (!block) return null;

  // 1. If block has an explicit task assigned by admin
  if (block.task && block.task.question && block.task.options) {
    return {
      taskId: block.task.taskId || `task-${block.blockId}`,
      title: block.task.title || `Task: ${block.hint || 'Logic Verification'}`,
      description: block.task.description || 'Complete this task to decrypt and unlock this code block.',
      question: block.task.question,
      options: block.task.options,
      correctAnswer: block.task.correctAnswer,
      blockId: block.blockId,
    };
  }

  // 2. If challenge has tasks linked to this blockId
  if (challenge?.tasks && Array.isArray(challenge.tasks)) {
    const linkedTask = challenge.tasks.find(
      (t) =>
        t.taskId === block.taskId ||
        (Array.isArray(t.requiredBlockIds) && t.requiredBlockIds.includes(block.blockId))
    );

    if (linkedTask && linkedTask.question && linkedTask.options) {
      return {
        taskId: linkedTask.taskId,
        title: linkedTask.title,
        description: linkedTask.description || 'Solve this challenge task to reveal the required block.',
        question: linkedTask.question,
        options: linkedTask.options,
        correctAnswer: linkedTask.correctAnswer,
        blockId: block.blockId,
      };
    }

    if (linkedTask) {
      // Generate question tailored to this task
      const dynamicQuestion = generateQuestionForBlock(block, language, linkedTask);
      return {
        taskId: linkedTask.taskId,
        title: linkedTask.title,
        description: linkedTask.description,
        ...dynamicQuestion,
        blockId: block.blockId,
      };
    }
  }

  // 3. Smart dynamic task generator based on block type and language
  const dynamic = generateQuestionForBlock(block, language);
  return {
    taskId: `task-${block.blockId}`,
    title: `Task #${block.blockId}: ${block.hint || getTypeName(block.type)}`,
    description: `Complete the verification task assigned for Block #${block.blockId} to decrypt and unlock it.`,
    ...dynamic,
    blockId: block.blockId,
  };
}

function getTypeName(type = 'LOGIC') {
  switch (type) {
    case 'INPUT': return 'Input Handling';
    case 'INIT': return 'Variable Initialization';
    case 'LOOP': return 'Loop Construction';
    case 'LOGIC': return 'Core Algorithm Logic';
    case 'OUTPUT': return 'Result Output Emission';
    case 'IMPORT': return 'Library & Module Import';
    case 'WRAPPER': return 'Program Structure Wrapper';
    case 'DECOY': return 'Bug & Distractor Analysis';
    case 'COMMENT': return 'Pipeline Verification';
    default: return 'Code Block Assembly';
  }
}

function generateQuestionForBlock(block, language = 'python', taskRef = null) {
  const type = block.type || 'LOGIC';
  const id = block.blockId;

  if (type === 'INPUT') {
    return {
      question: `What is the primary objective of this code block in the execution pipeline?`,
      options: [
        'Read and parse standard input data from the user/judge',
        'Directly print the output without reading anything',
        'Close the program process immediately',
        'Allocate dynamic heap memory for graphics',
      ],
      correctAnswer: 'Read and parse standard input data from the user/judge',
    };
  }

  if (type === 'INIT') {
    return {
      question: `Before running computational loops, why must accumulator variables be initialized?`,
      options: [
        'To establish a known initial state and prevent undefined behavior',
        'To terminate the program safely',
        'To format the console output string',
        'To import external system headers',
      ],
      correctAnswer: 'To establish a known initial state and prevent undefined behavior',
    };
  }

  if (type === 'LOOP') {
    return {
      question: `What role does this loop construct serve in the algorithm?`,
      options: [
        'Iterate systematically across the range of target values',
        'Execute only once and immediately terminate',
        'Create an infinite recursion condition',
        'Bypass input parsing entirely',
      ],
      correctAnswer: 'Iterate systematically across the range of target values',
    };
  }

  if (type === 'OUTPUT') {
    return {
      question: `Which stream is this block designed to write the final computed result to?`,
      options: [
        'Standard Output (stdout) for automated test grading',
        'A temporary hidden file on disk',
        'Standard Error stream exclusively',
        'Network socket connection',
      ],
      correctAnswer: 'Standard Output (stdout) for automated test grading',
    };
  }

  if (type === 'DECOY') {
    return {
      question: `Why is this block flagged as a DECOY / Distractor in competitive code assembly?`,
      options: [
        'It introduces logical errors, incorrect operations, or infinite traps',
        'It is required as the very first line of code',
        'It makes the code execute 100x faster',
        'It is a mandatory standard library import',
      ],
      correctAnswer: 'It introduces logical errors, incorrect operations, or infinite traps',
    };
  }

  if (type === 'IMPORT' || type === 'WRAPPER') {
    return {
      question: `What is the purpose of header imports / wrapper classes in compiled languages?`,
      options: [
        'Provide symbols, classes, and standard I/O library definitions',
        'Execute the main logic before the program starts',
        'Store test case answers in advance',
        'Encrypt the binary file on compilation',
      ],
      correctAnswer: 'Provide symbols, classes, and standard I/O library definitions',
    };
  }

  // Default LOGIC block
  return {
    question: `In algorithm construction, when should this logical step execute relative to input and output?`,
    options: [
      'After inputs are read, but before the final output is printed',
      'After the final output is printed',
      'Before variables are even declared',
      'At the very end of the file after process termination',
    ],
    correctAnswer: 'After inputs are read, but before the final output is printed',
  };
}
