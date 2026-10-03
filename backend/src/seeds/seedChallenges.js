/**
 * seedChallenges.js
 *
 * Populates the MongoDB database with challenges, tasks, and per-language block
 * configurations using the same data previously stored in frontend/src/data/challenges.js.
 *
 * Usage:
 *   cd backend
 *   node src/seeds/seedChallenges.js
 *
 * This is idempotent: it upserts by slug, so re-running is safe.
 */

const mongoose = require('mongoose');
const env = require('../config/env');
const Challenge = require('../models/Challenge');
const TestCase = require('../models/TestCase');
const QRBlock = require('../models/QRBlock');
const { generateQRToken } = require('../services/qr/qrValidation');

// ── Static challenge data (mirrored from frontend) ─────────────────────────

const QUIZ_TYPE_MAP = {
  mcq: 'MCQ',
  output: 'OUTPUT_PREDICTION',
  fill: 'FILL_BLANK',
};

const CHALLENGES_DATA = [  {
    slug: 'ch-05',
    title: 'Challenge 5 – Greatest Among Three Numbers',
    category: 'Conditionals & Logic',
    difficulty: 'Easy',
    points: 100,
    description:
      'Given three integers A, B, and C from standard input, determine and display the greatest (maximum) number among them.\n\nInput: Three integers separated by whitespace.\nOutput: A single integer representing the greatest value.',
    sampleInput: '10 25 15',
    sampleOutput: '25',
    timeLimitSeconds: 1200,
    supportedLanguages: ['python', 'java', 'cpp', 'c'],
    hiddenTests: [
      { input: '10 25 15', expectedOutput: '25', description: 'Middle operand maximum' },
      { input: '50 12 3', expectedOutput: '50', description: 'First operand maximum' },
      { input: '7 9 99', expectedOutput: '99', description: 'Third operand maximum' },
      { input: '-15 -5 -30', expectedOutput: '-5', description: 'All negative operands' },
      { input: '42 42 42', expectedOutput: '42', description: 'All three operands equal' },
      { input: '100 100 50', expectedOutput: '100', description: 'Two identical maximum operands' },
      { input: '15 200 200', expectedOutput: '200', description: 'Last two identical maximum operands' },
      { input: '0 0 -1', expectedOutput: '0', description: 'Zero boundary test' },
    ],
    languageConfigs: [
      {
        language: 'python',
        languageName: 'Python 3',
        blocks: [
          { blockId: 'py5-f1', code: 'import sys', role: 'MAIN_WRAPPER', order: 1 },
          { blockId: 'py5-f2', code: 'tokens = sys.stdin.read().split()\na, b, c = int(tokens[0]), int(tokens[1]), int(tokens[2])', role: 'INPUT', order: 2 },
          { blockId: 'py5-f3', code: 'if a >= b and a >= c:\n    ans = a\nelif b >= a and b >= c:\n    ans = b\nelse:\n    ans = c', role: 'LOGIC', order: 3 },
          { blockId: 'py5-f4', code: 'print(ans)', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['py5-f1', 'py5-f2', 'py5-f3', 'py5-f4'],
        acceptedOrders: [],
      },
      {
        language: 'java',
        languageName: 'Java 17',
        blocks: [
          { blockId: 'java5-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'MAIN_WRAPPER', order: 1 },
          { blockId: 'java5-f2', code: '        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        int c = sc.nextInt();', role: 'INPUT', order: 2 },
          { blockId: 'java5-f3', code: '        int maxVal;\n        if (a >= b && a >= c) {\n            maxVal = a;\n        } else if (b >= a && b >= c) {\n            maxVal = b;\n        } else {\n            maxVal = c;\n        }', role: 'LOGIC', order: 3 },
          { blockId: 'java5-f4', code: '        System.out.println(maxVal);\n    }\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['java5-f1', 'java5-f2', 'java5-f3', 'java5-f4'],
        acceptedOrders: [],
      },
      {
        language: 'cpp',
        languageName: 'C++ 17',
        blocks: [
          { blockId: 'cpp5-f1', code: '#include <iostream>\nusing namespace std;\n\nint main() {', role: 'MAIN_WRAPPER', order: 1 },
          { blockId: 'cpp5-f2', code: '    int a, b, c;\n    cin >> a >> b >> c;', role: 'INPUT', order: 2 },
          { blockId: 'cpp5-f3', code: '    int maxVal;\n    if (a >= b && a >= c) {\n        maxVal = a;\n    } else if (b >= a && b >= c) {\n        maxVal = b;\n    } else {\n        maxVal = c;\n    }', role: 'LOGIC', order: 3 },
          { blockId: 'cpp5-f4', code: '    cout << maxVal << endl;\n    return 0;\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['cpp5-f1', 'cpp5-f2', 'cpp5-f3', 'cpp5-f4'],
        acceptedOrders: [],
      },
      {
        language: 'c',
        languageName: 'C (GCC)',
        blocks: [
          { blockId: 'c5-f1', code: '#include <stdio.h>\n\nint main() {', role: 'MAIN_WRAPPER', order: 1 },
          { blockId: 'c5-f2', code: '    int a, b, c;\n    scanf("%d %d %d", &a, &b, &c);', role: 'INPUT', order: 2 },
          { blockId: 'c5-f3', code: '    int maxVal;\n    if (a >= b && a >= c) {\n        maxVal = a;\n    } else if (b >= a && b >= c) {\n        maxVal = b;\n    } else {\n        maxVal = c;\n    }', role: 'LOGIC', order: 3 },
          { blockId: 'c5-f4', code: '    printf("%d\\n", maxVal);\n    return 0;\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['c5-f1', 'c5-f2', 'c5-f3', 'c5-f4'],
        acceptedOrders: [],
      },
    ],
    tasks: [
      {
        taskId: 'task-1',
        title: 'Task 1: Program Entry & Boilerplate Setup',
        description: 'Complete this task to unlock the program skeleton and header imports.',
        order: 1,
        penalty: 20,
        cooldownSeconds: 3,
        rewards: {
          python: 'py5-f1',
          java: 'java5-f1',
          cpp: 'cpp5-f1',
          c: 'c5-f1',
        },
        quizPool: [
          {
            quizId: 'q5-entry-1',
            type: 'MCQ',
            prompt: 'In C and C++, which header file provides standard input/output functions?',
            options: ['<stdio.h> / <iostream>', '<stdlib.h>', '<math.h>', '<string.h>'],
            answer: 0,
            explain: '<stdio.h> provides printf/scanf in C, and <iostream> provides cin/cout in C++.',
            concept: 'imports',
          },
          {
            quizId: 'q5-entry-2',
            type: 'MCQ',
            prompt: 'What is the signature of the entry point method in standard Java applications?',
            options: ['public static void main(String[] args)', 'public void start()', 'static main()', 'void run(int args)'],
            answer: 0,
            explain: 'The JVM requires public static void main(String[] args) as the application entry point.',
            concept: 'java-entry',
          },
        ],
      },
      {
        taskId: 'task-2',
        title: 'Task 2: Read Three Input Values',
        description: 'Complete this task to unlock the standard input extraction block.',
        order: 2,
        penalty: 20,
        cooldownSeconds: 3,
        rewards: {
          python: 'py5-f2',
          java: 'java5-f2',
          cpp: 'cpp5-f2',
          c: 'c5-f2',
        },
        quizPool: [
          {
            quizId: 'q5-input-1',
            type: 'MCQ',
            prompt: 'In C, which scanf statement correctly reads three integer variables a, b, and c?',
            options: ['scanf("%d %d %d", &a, &b, &c);', 'scanf("%d", a, b, c);', 'cin >> a >> b >> c;', 'input(a, b, c);'],
            answer: 0,
            explain: 'scanf requires the "%d" format specifier and the address-of operator (&) for each variable.',
            concept: 'c-input',
          },
          {
            quizId: 'q5-input-2',
            type: 'MCQ',
            prompt: 'In Java, which method of the Scanner class reads the next integer token from input?',
            options: ['nextInt()', 'readInt()', 'next()', 'parseInteger()'],
            answer: 0,
            explain: '`Scanner.nextInt()` extracts the next integer token separated by whitespace.',
            concept: 'java-input',
          },
        ],
      },
      {
        taskId: 'task-3',
        title: 'Task 3: Compare Numbers & Determine Maximum',
        description: 'Complete this task to unlock the conditional logic block.',
        order: 3,
        penalty: 20,
        cooldownSeconds: 3,
        rewards: {
          python: 'py5-f3',
          java: 'java5-f3',
          cpp: 'cpp5-f3',
          c: 'c5-f3',
        },
        quizPool: [
          {
            quizId: 'q5-logic-1',
            type: 'MCQ',
            prompt: 'Which logical operator is used to verify that A is greater than or equal to BOTH B and C?',
            options: ['&& (Logical AND)', '|| (Logical OR)', '! (Logical NOT)', '^ (Bitwise XOR)'],
            answer: 0,
            explain: 'The logical AND operator (&& in C/C++/Java, `and` in Python) requires both conditions to evaluate to true.',
            concept: 'operators',
          },
          {
            quizId: 'q5-logic-2',
            type: 'OUTPUT_PREDICTION',
            prompt: 'What is the greatest value among A = -15, B = -5, and C = -30?',
            options: [],
            answer: '-5',
            explain: '-5 is closest to zero on the number line, making it the greatest negative value.',
            concept: 'negative-numbers',
          },
        ],
      },
      {
        taskId: 'task-4',
        title: 'Task 4: Output the Result',
        description: 'Complete this task to unlock the output printing and termination block.',
        order: 4,
        penalty: 20,
        cooldownSeconds: 3,
        rewards: {
          python: 'py5-f4',
          java: 'java5-f4',
          cpp: 'cpp5-f4',
          c: 'c5-f4',
        },
        quizPool: [
          {
            quizId: 'q5-out-1',
            type: 'MCQ',
            prompt: 'In C++, which stream manipulator advances the cursor to the next line and flushes the stream?',
            options: ['endl', 'flush', 'newline', 'break'],
            answer: 0,
            explain: '`endl` inserts a newline character into the output stream and flushes the buffer.',
            concept: 'cpp-output',
          },
          {
            quizId: 'q5-out-2',
            type: 'MCQ',
            prompt: 'In Python, what is the default behavior of `print()` after displaying arguments?',
            options: ['Appends a newline character (\\n)', 'Does not add any character', 'Appends a space', 'Terminates the program'],
            answer: 0,
            explain: 'Python `print()` ends with a newline character by default unless overridden with `end=...`.',
            concept: 'python-output',
          },
        ],
      },
    ],
  },
];

// ─── MAIN SEED FUNCTION ────────────────────────────────────────────────────

/**
 * Convert chest map + quizzes into server-side tasks.
 * Uses the largest language's chest count (they may differ) to determine total tasks.
 * Each task has a quizPool with proper quizzes from all languages' chest quizPools merged.
 */
function buildTasks(challengeData) {
  if (challengeData.tasks && challengeData.tasks.length > 0) {
    return challengeData.tasks;
  }
  const { chestMap, quizzes } = challengeData;
  if (!chestMap || !quizzes) return [];

  // Determine the maximum number of tasks across all languages
  const maxTasks = Math.max(...Object.values(chestMap).map((chests) => chests.length));
  const tasks = [];

  for (let i = 0; i < maxTasks; i++) {
    const taskId = `task-${i + 1}`;

    // Build rewards map: language -> blockId
    const rewards = {};
    Object.entries(chestMap).forEach(([lang, chests]) => {
      if (chests[i]) {
        rewards[lang] = chests[i].rewardBlock;
      }
    });

    // Collect unique quiz IDs from all languages for this task slot
    const quizIdSet = new Set();
    Object.values(chestMap).forEach((chests) => {
      if (chests[i]) {
        chests[i].quizPool.forEach((qid) => quizIdSet.add(qid));
      }
    });

    // Build quizPool with full quiz data
    const quizPool = [];
    quizIdSet.forEach((qid) => {
      const q = quizzes[qid];
      if (!q) return;
      quizPool.push({
        quizId: qid,
        type: QUIZ_TYPE_MAP[q.type] || 'MCQ',
        prompt: q.prompt,
        options: q.options || [],
        answer: q.answer,
        explain: q.explain || '',
        concept: q.concept || '',
      });
    });

    tasks.push({
      taskId,
      title: `Task ${i + 1}`,
      description: `Complete this task to unlock code block ${i + 1}`,
      order: i + 1,
      quizPool,
      rewards,
      penalty: 20,
      cooldownSeconds: 3,
    });
  }

  return tasks;
}

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  console.log('[Seed] Connected.');

  for (const cd of CHALLENGES_DATA) {
    console.log(`\n[Seed] Processing: ${cd.title}`);

    const tasks = buildTasks(cd);
    console.log(`  → Generated ${tasks.length} tasks`);

    // Build challenge document
    const challengeDoc = {
      title: cd.title,
      slug: cd.slug,
      category: cd.category,
      difficulty: cd.difficulty,
      points: cd.points,
      description: cd.description,
      sampleInput: cd.sampleInput,
      sampleOutput: cd.sampleOutput,
      timeLimitSeconds: cd.timeLimitSeconds,
      supportedLanguages: cd.supportedLanguages,
      status: 'Published',
      isActive: true,
      tasks,
      languageConfigs: cd.languageConfigs,
      blockConfig: {
        totalBlocks: Math.max(...cd.languageConfigs.map((lc) => lc.blocks.length)),
        revealMode: 'task',
        randomizeOrder: true,
      },
    };

    // Upsert by slug
    const existing = await Challenge.findOne({ slug: cd.slug });
    let challenge;
    if (existing) {
      challenge = await Challenge.findByIdAndUpdate(existing._id, challengeDoc, { new: true });
      console.log(`  → Updated existing challenge (${existing._id})`);
    } else {
      challenge = await Challenge.create(challengeDoc);
      console.log(`  → Created new challenge (${challenge._id})`);
    }

    // Upsert test cases
    await TestCase.deleteMany({ challengeId: challenge._id });
    if (cd.hiddenTests && cd.hiddenTests.length > 0) {
      const testDocs = cd.hiddenTests.map((t, idx) => ({
        challengeId: challenge._id,
        input: t.input,
        expectedOutput: t.expectedOutput,
        isHidden: true,
        weight: 20,
        isEnabled: true,
        orderIndex: idx,
        description: t.description || '',
      }));
      await TestCase.insertMany(testDocs);
      console.log(`  → Seeded ${testDocs.length} test cases`);
    }

    // Upsert QR Blocks across all language configs
    await QRBlock.deleteMany({
      $or: [{ challengeId: challenge._id }, { challengeId: challenge.slug }],
    });

    const qrBlockDocs = [];
    if (Array.isArray(cd.languageConfigs)) {
      for (const lc of cd.languageConfigs) {
        if (Array.isArray(lc.blocks)) {
          lc.blocks.forEach((block, idx) => {
            const token = generateQRToken(challenge._id, block.blockId, lc.language);
            qrBlockDocs.push({
              challengeId: challenge._id,
              blockId: block.blockId,
              title: `${challenge.title} - ${lc.language.toUpperCase()} Block ${block.order || idx + 1}`,
              language: lc.language,
              code: block.code,
              codeSnippet: block.code,
              type: block.role || 'LOGIC',
              blockType: block.role || 'LOGIC',
              isDecoy: !!block.isDecoy,
              correctOrder: block.order || idx + 1,
              originalOrder: block.order || idx + 1,
              displayOrder: lc.revealOrder ? lc.revealOrder.indexOf(block.blockId) + 1 : idx + 1,
              qrToken: token,
              qrHash: token,
            });
          });
        }
      }
    }

    if (qrBlockDocs.length > 0) {
      await QRBlock.insertMany(qrBlockDocs);
      console.log(`  → Seeded ${qrBlockDocs.length} QR blocks for ${cd.languageConfigs.length} languages`);
    }

    console.log(`  ✓ Done: ${challenge.title}`);
  }

  console.log('\n[Seed] All challenges seeded successfully!');
  if (require.main === module) {
    await mongoose.disconnect();
    process.exit(0);
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('[Seed] Error:', err);
    process.exit(1);
  });
}

module.exports = seed;
