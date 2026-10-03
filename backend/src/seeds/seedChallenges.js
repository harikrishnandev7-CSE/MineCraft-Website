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

const CHALLENGES_DATA = [
  // ─── CHALLENGE 1 – FIND THE SUM ─────────────────────────────────────────
  {
    slug: 'ch-01',
    title: 'Challenge 1 – Find the Sum',
    category: 'Math & Accumulation',
    difficulty: 'Medium',
    points: 100,
    description:
      'Given a positive integer N from standard input, calculate and display the total sum of all natural numbers from 1 up to N (inclusive).\n\nFormula: Sum = 1 + 2 + 3 + ... + N',
    sampleInput: '5',
    sampleOutput: '15',
    timeLimitSeconds: 1200,
    supportedLanguages: ['python', 'cpp', 'c', 'java'],
    hiddenTests: [
      { input: '5', expectedOutput: '15', description: 'Base sample test' },
      { input: '10', expectedOutput: '55', description: 'Mid-range accumulation' },
      { input: '20', expectedOutput: '210', description: 'Upper bound validation' },
    ],
    languageConfigs: [
      {
        language: 'python',
        languageName: 'Python 3',
        blocks: [
          { blockId: 'py1-f1', code: 'n = int(input().strip())', role: 'INPUT', order: 1 },
          { blockId: 'py1-f2', code: 'total = 0\nfor i in range(1, n + 1):\n    total += i', role: 'LOGIC', order: 2 },
          { blockId: 'py1-f3', code: 'print(total)', role: 'OUTPUT', order: 3 },
        ],
        revealOrder: ['py1-f3', 'py1-f1', 'py1-f2'],
        acceptedOrders: [],
      },
      {
        language: 'cpp',
        languageName: 'C++ 17',
        blocks: [
          { blockId: 'cpp1-f1', code: '#include <iostream>\nusing namespace std;', role: 'IMPORT', order: 1 },
          { blockId: 'cpp1-f2', code: 'int main() {\n    int n, total = 0;\n    cin >> n;', role: 'INPUT', order: 2 },
          { blockId: 'cpp1-f3', code: '    for (int i = 1; i <= n; i++) {\n        total += i;\n    }', role: 'LOGIC', order: 3 },
          { blockId: 'cpp1-f4', code: '    cout << total << endl;', role: 'OUTPUT', order: 4 },
          { blockId: 'cpp1-f5', code: '    return 0;\n}', role: 'CLOSE', order: 5 },
        ],
        revealOrder: ['cpp1-f4', 'cpp1-f1', 'cpp1-f3', 'cpp1-f5', 'cpp1-f2'],
        acceptedOrders: [],
      },
      {
        language: 'c',
        languageName: 'C (GCC)',
        blocks: [
          { blockId: 'c1-f1', code: '#include <stdio.h>', role: 'IMPORT', order: 1 },
          { blockId: 'c1-f2', code: 'int main() {\n    int n, total = 0;\n    scanf("%d", &n);', role: 'INPUT', order: 2 },
          { blockId: 'c1-f3', code: '    for (int i = 1; i <= n; i++) {\n        total += i;\n    }', role: 'LOGIC', order: 3 },
          { blockId: 'c1-f4', code: '    printf("%d\\n", total);', role: 'OUTPUT', order: 4 },
          { blockId: 'c1-f5', code: '    return 0;\n}', role: 'CLOSE', order: 5 },
        ],
        revealOrder: ['c1-f3', 'c1-f5', 'c1-f1', 'c1-f4', 'c1-f2'],
        acceptedOrders: [],
      },
      {
        language: 'java',
        languageName: 'Java 11',
        blocks: [
          { blockId: 'java1-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER', order: 1 },
          { blockId: 'java1-f2', code: '        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int total = 0;', role: 'INPUT', order: 2 },
          { blockId: 'java1-f3', code: '        for (int i = 1; i <= n; i++) {\n            total += i;\n        }', role: 'LOGIC', order: 3 },
          { blockId: 'java1-f4', code: '        System.out.println(total);', role: 'OUTPUT', order: 4 },
          { blockId: 'java1-f5', code: '    }\n}', role: 'CLOSE', order: 5 },
        ],
        revealOrder: ['java1-f4', 'java1-f2', 'java1-f5', 'java1-f1', 'java1-f3'],
        acceptedOrders: [],
      },
    ],
    quizzes: {
      'q1-sum-1': { type: 'mcq', concept: 'loops', prompt: 'How many times does `for i in range(1, n + 1)` iterate when n = 5?', options: ['4', '5', '6', 'n + 1'], answer: 1, explain: 'range(1, 6) yields 1, 2, 3, 4, 5 → 5 iterations.' },
      'q1-sum-2': { type: 'output', concept: 'accumulation', prompt: 'What does this print?\n\ntotal = 0\nfor i in range(1, 4):\n    total += i\nprint(total)', answer: '6', explain: '1 + 2 + 3 = 6.' },
      'q1-sum-3': { type: 'fill', concept: 'syntax', prompt: 'Complete the line: `total ___ i`  (adds i to total each iteration)', answer: ['+=', '+= i'], explain: '+= is the addition-assignment operator.' },
      'q1-sum-4': { type: 'mcq', concept: 'accumulation', prompt: 'Which variable holds the running sum in the Python solution?', options: ['n', 'i', 'total', 'result'], answer: 2, explain: '`total` is initialised to 0 and accumulated with each i.' },
      'q1-sum-5': { type: 'mcq', concept: 'input', prompt: 'Which function reads N as an integer from stdin in Python?', options: ['input()', 'int(input())', 'read()', 'scan()'], answer: 1, explain: 'int(input()) reads the string and converts it.' },
      'q1-sum-6': { type: 'output', concept: 'loops', prompt: 'What is printed?\n\ntotal = 0\nfor i in range(1, 6):\n    total += i\nprint(total)', answer: '15', explain: '1+2+3+4+5 = 15.' },
      'q1-sum-7': { type: 'mcq', concept: 'cpp-syntax', prompt: 'In C++, which statement reads an integer from stdin?', options: ['scanf("%d",&n)', 'cin >> n', 'gets(n)', 'readline(n)'], answer: 1, explain: '`cin >> n` extracts an integer from standard input in C++.' },
      'q1-sum-8': { type: 'fill', concept: 'loops', prompt: 'Fill in the blank: `for (int i = 1; i ___ n; i++)` to iterate from 1 to N inclusive.', answer: ['<=', '< n + 1'], explain: 'Using <= n ensures i reaches n on the last iteration.' },
      'q1-sum-9': { type: 'mcq', concept: 'java-syntax', prompt: 'In Java, which class is used to read integers from stdin?', options: ['System.in', 'BufferedReader', 'Scanner', 'InputStreamReader'], answer: 2, explain: '`Scanner sc = new Scanner(System.in)` is the idiomatic Java approach.' },
    },
    // chest-to-quiz mapping per language (from original static data)
    chestMap: {
      python: [
        { quizPool: ['q1-sum-1', 'q1-sum-2'], rewardBlock: 'py1-f3' },
        { quizPool: ['q1-sum-3', 'q1-sum-4'], rewardBlock: 'py1-f1' },
        { quizPool: ['q1-sum-5', 'q1-sum-6'], rewardBlock: 'py1-f2' },
      ],
      cpp: [
        { quizPool: ['q1-sum-7', 'q1-sum-8'], rewardBlock: 'cpp1-f4' },
        { quizPool: ['q1-sum-1', 'q1-sum-3'], rewardBlock: 'cpp1-f1' },
        { quizPool: ['q1-sum-5', 'q1-sum-9'], rewardBlock: 'cpp1-f3' },
        { quizPool: ['q1-sum-2', 'q1-sum-6'], rewardBlock: 'cpp1-f5' },
        { quizPool: ['q1-sum-4', 'q1-sum-7'], rewardBlock: 'cpp1-f2' },
      ],
      c: [
        { quizPool: ['q1-sum-1', 'q1-sum-8'], rewardBlock: 'c1-f3' },
        { quizPool: ['q1-sum-7', 'q1-sum-3'], rewardBlock: 'c1-f5' },
        { quizPool: ['q1-sum-5', 'q1-sum-2'], rewardBlock: 'c1-f1' },
        { quizPool: ['q1-sum-6', 'q1-sum-9'], rewardBlock: 'c1-f4' },
        { quizPool: ['q1-sum-4', 'q1-sum-1'], rewardBlock: 'c1-f2' },
      ],
      java: [
        { quizPool: ['q1-sum-9', 'q1-sum-1'], rewardBlock: 'java1-f4' },
        { quizPool: ['q1-sum-7', 'q1-sum-4'], rewardBlock: 'java1-f2' },
        { quizPool: ['q1-sum-3', 'q1-sum-8'], rewardBlock: 'java1-f5' },
        { quizPool: ['q1-sum-2', 'q1-sum-5'], rewardBlock: 'java1-f1' },
        { quizPool: ['q1-sum-6', 'q1-sum-9'], rewardBlock: 'java1-f3' },
      ],
    },
  },

  // ─── CHALLENGE 2 – REVERSE A STRING ──────────────────────────────────────
  {
    slug: 'ch-02',
    title: 'Challenge 2 – Reverse a String',
    category: 'Strings & Pointers',
    difficulty: 'Easy',
    points: 100,
    description:
      "Read an input word or sequence of characters from standard input and print the exact reversed string.\n\nExample: 'hello' becomes 'olleh'.",
    sampleInput: 'hello',
    sampleOutput: 'olleh',
    timeLimitSeconds: 1200,
    supportedLanguages: ['python', 'cpp', 'c', 'java'],
    hiddenTests: [
      { input: 'mindcraft', expectedOutput: 'tfardcnim', description: 'Platform name reversal' },
      { input: 'racecar', expectedOutput: 'racecar', description: 'Palindrome preservation' },
      { input: 'algorithm', expectedOutput: 'mihtirogla', description: 'General vocabulary' },
    ],
    languageConfigs: [
      {
        language: 'python', languageName: 'Python 3',
        blocks: [
          { blockId: 'py2-f1', code: 's = input().strip()', role: 'INPUT', order: 1 },
          { blockId: 'py2-f2', code: 'rev = s[::-1]', role: 'LOGIC', order: 2 },
          { blockId: 'py2-f3', code: 'print(rev)', role: 'OUTPUT', order: 3 },
        ],
        revealOrder: ['py2-f2', 'py2-f3', 'py2-f1'], acceptedOrders: [],
      },
      {
        language: 'cpp', languageName: 'C++ 17',
        blocks: [
          { blockId: 'cpp2-f1', code: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;', role: 'IMPORT', order: 1 },
          { blockId: 'cpp2-f2', code: 'int main() {\n    string s;\n    cin >> s;', role: 'INPUT', order: 2 },
          { blockId: 'cpp2-f3', code: '    reverse(s.begin(), s.end());', role: 'LOGIC', order: 3 },
          { blockId: 'cpp2-f4', code: '    cout << s << endl;\n    return 0;\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['cpp2-f3', 'cpp2-f1', 'cpp2-f4', 'cpp2-f2'], acceptedOrders: [],
      },
      {
        language: 'c', languageName: 'C (GCC)',
        blocks: [
          { blockId: 'c2-f1', code: '#include <stdio.h>\n#include <string.h>', role: 'IMPORT', order: 1 },
          { blockId: 'c2-f2', code: 'int main() {\n    char s[1000];\n    scanf("%s", s);', role: 'INPUT', order: 2 },
          { blockId: 'c2-f3', code: '    int len = strlen(s);\n    for (int i = 0; i < len / 2; i++) {\n        char tmp = s[i];\n        s[i] = s[len - 1 - i];\n        s[len - 1 - i] = tmp;\n    }', role: 'LOGIC', order: 3 },
          { blockId: 'c2-f4', code: '    printf("%s\\n", s);\n    return 0;\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['c2-f4', 'c2-f2', 'c2-f1', 'c2-f3'], acceptedOrders: [],
      },
      {
        language: 'java', languageName: 'Java 11',
        blocks: [
          { blockId: 'java2-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER', order: 1 },
          { blockId: 'java2-f2', code: '        Scanner sc = new Scanner(System.in);\n        String s = sc.next();', role: 'INPUT', order: 2 },
          { blockId: 'java2-f3', code: '        StringBuilder sb = new StringBuilder(s);\n        String rev = sb.reverse().toString();', role: 'LOGIC', order: 3 },
          { blockId: 'java2-f4', code: '        System.out.println(rev);\n    }\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['java2-f3', 'java2-f4', 'java2-f1', 'java2-f2'], acceptedOrders: [],
      },
    ],
    quizzes: {
      'q2-rev-1': { type: 'mcq', concept: 'slicing', prompt: 'In Python, `s[::-1]` on a string "hello" returns:', options: ['"hello"', '"olleh"', '"hell"', 'Error'], answer: 1, explain: 'Slice step -1 traverses characters from end to start.' },
      'q2-rev-2': { type: 'output', concept: 'slicing', prompt: 'What does this print?\n\ns = "abc"\nprint(s[::-1])', answer: 'cba', explain: 'Reversed slice: c, b, a.' },
      'q2-rev-3': { type: 'fill', concept: 'syntax', prompt: 'Complete: `rev = s[___]`  to reverse string s in Python', answer: ['::-1', ':: -1'], explain: 's[::-1] uses extended slice with step -1.' },
      'q2-rev-4': { type: 'mcq', concept: 'string-ops', prompt: 'Which C++ function reverses a string in-place?', options: ['str.flip()', 'reverse(s.begin(), s.end())', 'strrev(s)', 's.invert()'], answer: 1, explain: 'std::reverse from <algorithm> reverses iterators in-place.' },
      'q2-rev-5': { type: 'mcq', concept: 'java-ops', prompt: 'Which Java class has a `.reverse()` method for strings?', options: ['String', 'StringBuffer', 'StringBuilder', 'Both B and C'], answer: 3, explain: 'Both StringBuffer and StringBuilder have .reverse().' },
      'q2-rev-6': { type: 'output', concept: 'string-ops', prompt: 'What does this Java code print?\n\nString s = "hi";\nStringBuilder sb = new StringBuilder(s);\nSystem.out.println(sb.reverse().toString());', answer: 'ih', explain: 'StringBuilder.reverse() reverses the character sequence.' },
      'q2-rev-7': { type: 'mcq', concept: 'c-ops', prompt: 'Which C function returns the length of a C-string?', options: ['len(s)', 'sizeof(s)', 'strlen(s)', 'length(s)'], answer: 2, explain: 'strlen() from <string.h> counts characters up to null terminator.' },
      'q2-rev-8': { type: 'fill', concept: 'loops', prompt: 'In the C swap-based reversal loop, the loop runs while `i < ___`.', answer: ['len / 2', 'len/2'], explain: 'Only need to swap up to the midpoint; beyond that the string is mirrored.' },
    },
    chestMap: {
      python: [
        { quizPool: ['q2-rev-1', 'q2-rev-2'], rewardBlock: 'py2-f2' },
        { quizPool: ['q2-rev-3', 'q2-rev-4'], rewardBlock: 'py2-f3' },
        { quizPool: ['q2-rev-5', 'q2-rev-6'], rewardBlock: 'py2-f1' },
      ],
      cpp: [
        { quizPool: ['q2-rev-7', 'q2-rev-1'], rewardBlock: 'cpp2-f3' },
        { quizPool: ['q2-rev-2', 'q2-rev-8'], rewardBlock: 'cpp2-f1' },
        { quizPool: ['q2-rev-3', 'q2-rev-5'], rewardBlock: 'cpp2-f4' },
        { quizPool: ['q2-rev-6', 'q2-rev-4'], rewardBlock: 'cpp2-f2' },
      ],
      c: [
        { quizPool: ['q2-rev-1', 'q2-rev-7'], rewardBlock: 'c2-f4' },
        { quizPool: ['q2-rev-8', 'q2-rev-4'], rewardBlock: 'c2-f2' },
        { quizPool: ['q2-rev-3', 'q2-rev-6'], rewardBlock: 'c2-f1' },
        { quizPool: ['q2-rev-2', 'q2-rev-5'], rewardBlock: 'c2-f3' },
      ],
      java: [
        { quizPool: ['q2-rev-5', 'q2-rev-2'], rewardBlock: 'java2-f3' },
        { quizPool: ['q2-rev-8', 'q2-rev-1'], rewardBlock: 'java2-f4' },
        { quizPool: ['q2-rev-6', 'q2-rev-3'], rewardBlock: 'java2-f1' },
        { quizPool: ['q2-rev-4', 'q2-rev-7'], rewardBlock: 'java2-f2' },
      ],
    },
  },

  // ─── CHALLENGE 3 – FIND THE LARGEST NUMBER ───────────────────────────────
  {
    slug: 'ch-03',
    title: 'Challenge 3 – Find the Largest Number',
    category: 'Array Traversal',
    difficulty: 'Hard',
    points: 120,
    description: 'Given space-separated integers on standard input, determine and print the maximum (largest) integer in the sequence.',
    sampleInput: '3 8 2 15 6',
    sampleOutput: '15',
    timeLimitSeconds: 1200,
    supportedLanguages: ['python', 'cpp', 'c', 'java'],
    hiddenTests: [
      { input: '10 45 2 99 31', expectedOutput: '99', description: 'Multi-element sequence' },
      { input: '-5 -1 -20 -3', expectedOutput: '-1', description: 'Negative integers handling' },
      { input: '100 200 50 400 150', expectedOutput: '400', description: 'Triple digit values' },
    ],
    languageConfigs: [
      {
        language: 'python', languageName: 'Python 3',
        blocks: [
          { blockId: 'py3-f1', code: 'nums = list(map(int, input().split()))', role: 'INPUT', order: 1 },
          { blockId: 'py3-f2', code: 'max_val = nums[0]', role: 'INIT', order: 2 },
          { blockId: 'py3-f3', code: 'for x in nums[1:]:\n    if x > max_val:\n        max_val = x', role: 'LOGIC', order: 3 },
          { blockId: 'py3-f4', code: 'print(max_val)', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['py3-f3', 'py3-f1', 'py3-f4', 'py3-f2'], acceptedOrders: [],
      },
      {
        language: 'cpp', languageName: 'C++ 17',
        blocks: [
          { blockId: 'cpp3-f1', code: '#include <iostream>\nusing namespace std;', role: 'IMPORT', order: 1 },
          { blockId: 'cpp3-f2', code: 'int main() {\n    int x, max_val;\n    cin >> max_val;', role: 'INIT', order: 2 },
          { blockId: 'cpp3-f3', code: '    while (cin >> x) {\n        if (x > max_val) max_val = x;\n    }', role: 'LOGIC', order: 3 },
          { blockId: 'cpp3-f4', code: '    cout << max_val << endl;\n    return 0;\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['cpp3-f3', 'cpp3-f4', 'cpp3-f1', 'cpp3-f2'], acceptedOrders: [],
      },
      {
        language: 'c', languageName: 'C (GCC)',
        blocks: [
          { blockId: 'c3-f1', code: '#include <stdio.h>', role: 'IMPORT', order: 1 },
          { blockId: 'c3-f2', code: 'int main() {\n    int x, max_val;\n    scanf("%d", &max_val);', role: 'INIT', order: 2 },
          { blockId: 'c3-f3', code: '    while (scanf("%d", &x) == 1) {\n        if (x > max_val) max_val = x;\n    }', role: 'LOGIC', order: 3 },
          { blockId: 'c3-f4', code: '    printf("%d\\n", max_val);\n    return 0;\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['c3-f2', 'c3-f4', 'c3-f3', 'c3-f1'], acceptedOrders: [],
      },
      {
        language: 'java', languageName: 'Java 11',
        blocks: [
          { blockId: 'java3-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER', order: 1 },
          { blockId: 'java3-f2', code: '        Scanner sc = new Scanner(System.in);\n        int maxVal = sc.nextInt();', role: 'INIT', order: 2 },
          { blockId: 'java3-f3', code: '        while (sc.hasNextInt()) {\n            int x = sc.nextInt();\n            if (x > maxVal) maxVal = x;\n        }', role: 'LOGIC', order: 3 },
          { blockId: 'java3-f4', code: '        System.out.println(maxVal);\n    }\n}', role: 'OUTPUT', order: 4 },
        ],
        revealOrder: ['java3-f4', 'java3-f3', 'java3-f1', 'java3-f2'], acceptedOrders: [],
      },
    ],
    quizzes: {
      'q3-max-1': { type: 'mcq', concept: 'comparison', prompt: 'Which Python expression correctly checks if x is greater than max_val?', options: ['x == max_val', 'x > max_val', 'x >= max_val', 'max_val > x'], answer: 1, explain: 'x > max_val is true when x is strictly greater.' },
      'q3-max-2': { type: 'output', concept: 'traversal', prompt: 'What does this print?\n\nnums = [3, 8, 2, 15, 6]\nmax_val = nums[0]\nfor x in nums[1:]:\n    if x > max_val:\n        max_val = x\nprint(max_val)', answer: '15', explain: '15 is the largest element.' },
      'q3-max-3': { type: 'fill', concept: 'init', prompt: 'To start the max search in Python, we initialise max_val with `nums[___]` to avoid assuming the range.', answer: ['0', '[0]'], explain: 'nums[0] safely seeds max_val with the first element.' },
      'q3-max-4': { type: 'mcq', concept: 'loops', prompt: 'In `for x in nums[1:]:` why do we start at index 1?', options: ['To skip the last element', 'Because index 0 is already used as the initial max', 'Python lists start at 1', 'To avoid an off-by-one error in the output'], answer: 1, explain: 'Index 0 is used to seed max_val, so we compare from index 1 onward.' },
      'q3-max-5': { type: 'mcq', concept: 'cpp-input', prompt: 'In C++, `while (cin >> x)` reads integers until:', options: ['x == 0', 'EOF or invalid input', 'x > 1000', 'The loop runs 10 times'], answer: 1, explain: 'cin >> x returns false on EOF or read failure.' },
      'q3-max-6': { type: 'output', concept: 'negative-nums', prompt: 'What does this print?\n\nnums = [-5, -1, -20, -3]\nmax_val = nums[0]\nfor x in nums[1:]:\n    if x > max_val:\n        max_val = x\nprint(max_val)', answer: '-1', explain: '-1 is the largest among all negative values.' },
      'q3-max-7': { type: 'fill', concept: 'c-scanf', prompt: 'In C, `while (scanf("%d", &x) ___ 1)` reads integers until EOF.', answer: ['== 1', '==1'], explain: 'scanf returns the number of items read; == 1 means one integer was read successfully.' },
      'q3-max-8': { type: 'mcq', concept: 'java-scanner', prompt: 'In Java, `sc.hasNextInt()` returns:', options: ['The next integer', 'True if the next token is an integer, false otherwise', 'The count of remaining integers', 'True only if the Scanner is at EOF'], answer: 1, explain: 'hasNextInt() peeks ahead without consuming, returns boolean.' },
    },
    chestMap: {
      python: [
        { quizPool: ['q3-max-1', 'q3-max-2'], rewardBlock: 'py3-f3' },
        { quizPool: ['q3-max-3', 'q3-max-4'], rewardBlock: 'py3-f1' },
        { quizPool: ['q3-max-5', 'q3-max-6'], rewardBlock: 'py3-f4' },
        { quizPool: ['q3-max-7', 'q3-max-1'], rewardBlock: 'py3-f2' },
      ],
      cpp: [
        { quizPool: ['q3-max-7', 'q3-max-3'], rewardBlock: 'cpp3-f3' },
        { quizPool: ['q3-max-1', 'q3-max-5'], rewardBlock: 'cpp3-f4' },
        { quizPool: ['q3-max-6', 'q3-max-2'], rewardBlock: 'cpp3-f1' },
        { quizPool: ['q3-max-4', 'q3-max-8'], rewardBlock: 'cpp3-f2' },
      ],
      c: [
        { quizPool: ['q3-max-2', 'q3-max-8'], rewardBlock: 'c3-f2' },
        { quizPool: ['q3-max-6', 'q3-max-1'], rewardBlock: 'c3-f4' },
        { quizPool: ['q3-max-3', 'q3-max-5'], rewardBlock: 'c3-f3' },
        { quizPool: ['q3-max-7', 'q3-max-4'], rewardBlock: 'c3-f1' },
      ],
      java: [
        { quizPool: ['q3-max-5', 'q3-max-7'], rewardBlock: 'java3-f4' },
        { quizPool: ['q3-max-3', 'q3-max-8'], rewardBlock: 'java3-f3' },
        { quizPool: ['q3-max-1', 'q3-max-2'], rewardBlock: 'java3-f1' },
        { quizPool: ['q3-max-6', 'q3-max-4'], rewardBlock: 'java3-f2' },
      ],
    },
  },

  // ─── CHALLENGE 4 – STAR PYRAMID ──────────────────────────────────────────
  {
    slug: 'ch-04',
    title: 'Challenge 4 – Star Pyramid',
    category: 'Nested Loops & Patterns',
    difficulty: 'Hard',
    points: 150,
    description: 'Given a positive integer N from standard input, print a left-aligned star pyramid of N rows.\n\nRow i (1-indexed) contains exactly i stars.\n\nExample for N=4:\n*\n**\n***\n****',
    sampleInput: '4',
    sampleOutput: '*\n**\n***\n****',
    timeLimitSeconds: 1200,
    supportedLanguages: ['python', 'cpp', 'c', 'java'],
    hiddenTests: [
      { input: '4', expectedOutput: '*\n**\n***\n****', description: 'Basic pyramid 4 rows' },
      { input: '1', expectedOutput: '*', description: 'Single row edge case' },
      { input: '6', expectedOutput: '*\n**\n***\n****\n*****\n******', description: 'Six-row pyramid' },
    ],
    languageConfigs: [
      {
        language: 'python', languageName: 'Python 3',
        blocks: [
          { blockId: 'py4-f1', code: 'n = int(input().strip())', role: 'INPUT', order: 1 },
          { blockId: 'py4-f2', code: 'for i in range(1, n + 1):', role: 'OUTER_LOOP', order: 2 },
          { blockId: 'py4-f3', code: "    print('*' * i)", role: 'OUTPUT', order: 3 },
        ],
        revealOrder: ['py4-f3', 'py4-f1', 'py4-f2'], acceptedOrders: [],
      },
      {
        language: 'cpp', languageName: 'C++ 17',
        blocks: [
          { blockId: 'cpp4-f1', code: '#include <iostream>\nusing namespace std;', role: 'IMPORT', order: 1 },
          { blockId: 'cpp4-f2', code: 'int main() {\n    int n;\n    cin >> n;', role: 'INPUT', order: 2 },
          { blockId: 'cpp4-f3', code: '    for (int i = 1; i <= n; i++) {', role: 'OUTER_LOOP', order: 3 },
          { blockId: 'cpp4-f4', code: '        for (int j = 0; j < i; j++) {\n            cout << "*";\n        }', role: 'INNER_LOOP', order: 4 },
          { blockId: 'cpp4-f5', code: '        cout << endl;\n    }', role: 'ROW_END', order: 5 },
          { blockId: 'cpp4-f6', code: '    return 0;\n}', role: 'CLOSE', order: 6 },
        ],
        revealOrder: ['cpp4-f4', 'cpp4-f1', 'cpp4-f6', 'cpp4-f3', 'cpp4-f2', 'cpp4-f5'], acceptedOrders: [],
      },
      {
        language: 'c', languageName: 'C (GCC)',
        blocks: [
          { blockId: 'c4-f1', code: '#include <stdio.h>', role: 'IMPORT', order: 1 },
          { blockId: 'c4-f2', code: 'int main() {\n    int n;\n    scanf("%d", &n);', role: 'INPUT', order: 2 },
          { blockId: 'c4-f3', code: '    for (int i = 1; i <= n; i++) {', role: 'OUTER_LOOP', order: 3 },
          { blockId: 'c4-f4', code: '        for (int j = 0; j < i; j++) {\n            printf("*");\n        }', role: 'INNER_LOOP', order: 4 },
          { blockId: 'c4-f5', code: '        printf("\\n");\n    }', role: 'ROW_END', order: 5 },
          { blockId: 'c4-f6', code: '    return 0;\n}', role: 'CLOSE', order: 6 },
        ],
        revealOrder: ['c4-f5', 'c4-f3', 'c4-f1', 'c4-f4', 'c4-f6', 'c4-f2'], acceptedOrders: [],
      },
      {
        language: 'java', languageName: 'Java 11',
        blocks: [
          { blockId: 'java4-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER', order: 1 },
          { blockId: 'java4-f2', code: '        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();', role: 'INPUT', order: 2 },
          { blockId: 'java4-f3', code: '        for (int i = 1; i <= n; i++) {', role: 'OUTER_LOOP', order: 3 },
          { blockId: 'java4-f4', code: '            for (int j = 0; j < i; j++) {\n                System.out.print("*");\n            }', role: 'INNER_LOOP', order: 4 },
          { blockId: 'java4-f5', code: '            System.out.println();', role: 'ROW_END', order: 5 },
          { blockId: 'java4-f6', code: '        }\n    }\n}', role: 'CLOSE', order: 6 },
        ],
        revealOrder: ['java4-f4', 'java4-f6', 'java4-f2', 'java4-f1', 'java4-f5', 'java4-f3'], acceptedOrders: [],
      },
    ],
    quizzes: {
      'q4-pyr-1': { type: 'mcq', concept: 'nested-loops', prompt: 'In a star pyramid, how many stars appear on row i (1-indexed)?', options: ['i - 1', 'i', 'i + 1', 'n - i'], answer: 1, explain: 'Row 1 has 1 star, row 2 has 2 stars, ..., row i has i stars.' },
      'q4-pyr-2': { type: 'output', concept: 'pattern', prompt: "What does `print('*' * 3)` output in Python?", answer: '***', explain: "String multiplication repeats '*' three times." },
      'q4-pyr-3': { type: 'mcq', concept: 'outer-loop', prompt: 'The outer loop in a star pyramid iterates over:', options: ['Number of stars per row', 'Row number (1 to N)', 'Column count', 'Diagonal index'], answer: 1, explain: 'The outer loop runs from row 1 to N, one iteration per row.' },
      'q4-pyr-4': { type: 'fill', concept: 'inner-loop', prompt: 'Fill the blank: `for (int j = 0; j < ___; j++)` to print i stars on row i in C++.', answer: ['i', 'i;'], explain: 'j < i means j takes values 0, 1, ..., i-1 → i iterations.' },
      'q4-pyr-5': { type: 'output', concept: 'nested-loops', prompt: 'How many total stars are printed for N = 3?', answer: '6', explain: 'Row 1: 1 star, row 2: 2 stars, row 3: 3 stars → 1+2+3 = 6.' },
      'q4-pyr-6': { type: 'mcq', concept: 'newline', prompt: 'After printing stars on a row in C++, you call:', options: ['cout << "\\n"', 'cout << endl', 'printf("\\n")', 'Both A and B'], answer: 3, explain: 'Both cout << "\\n" and cout << endl advance to the next line in C++.' },
      'q4-pyr-7': { type: 'mcq', concept: 'java-output', prompt: 'In Java, `System.out.print("*")` vs `System.out.println("*")`:', options: ['Both add a newline after *', 'print does NOT add a newline; println does', 'println does NOT add a newline; print does', 'Both are identical'], answer: 1, explain: 'print appends nothing; println appends the platform newline.' },
      'q4-pyr-8': { type: 'fill', concept: 'outer-loop-bound', prompt: 'Fill: `for i in range(1, ___ + 1):` to loop row numbers 1 through N in Python.', answer: ['n', 'N'], explain: 'range(1, n + 1) generates 1, 2, ..., n.' },
    },
    chestMap: {
      python: [
        { quizPool: ['q4-pyr-1', 'q4-pyr-2'], rewardBlock: 'py4-f3' },
        { quizPool: ['q4-pyr-3', 'q4-pyr-4'], rewardBlock: 'py4-f1' },
        { quizPool: ['q4-pyr-5', 'q4-pyr-6'], rewardBlock: 'py4-f2' },
      ],
      cpp: [
        { quizPool: ['q4-pyr-7', 'q4-pyr-2'], rewardBlock: 'cpp4-f4' },
        { quizPool: ['q4-pyr-1', 'q4-pyr-8'], rewardBlock: 'cpp4-f1' },
        { quizPool: ['q4-pyr-3', 'q4-pyr-6'], rewardBlock: 'cpp4-f6' },
        { quizPool: ['q4-pyr-5', 'q4-pyr-4'], rewardBlock: 'cpp4-f3' },
        { quizPool: ['q4-pyr-8', 'q4-pyr-7'], rewardBlock: 'cpp4-f2' },
        { quizPool: ['q4-pyr-4', 'q4-pyr-1'], rewardBlock: 'cpp4-f5' },
      ],
      c: [
        { quizPool: ['q4-pyr-2', 'q4-pyr-7'], rewardBlock: 'c4-f5' },
        { quizPool: ['q4-pyr-8', 'q4-pyr-3'], rewardBlock: 'c4-f3' },
        { quizPool: ['q4-pyr-1', 'q4-pyr-5'], rewardBlock: 'c4-f1' },
        { quizPool: ['q4-pyr-4', 'q4-pyr-6'], rewardBlock: 'c4-f4' },
        { quizPool: ['q4-pyr-7', 'q4-pyr-2'], rewardBlock: 'c4-f6' },
        { quizPool: ['q4-pyr-6', 'q4-pyr-8'], rewardBlock: 'c4-f2' },
      ],
      java: [
        { quizPool: ['q4-pyr-3', 'q4-pyr-8'], rewardBlock: 'java4-f4' },
        { quizPool: ['q4-pyr-7', 'q4-pyr-5'], rewardBlock: 'java4-f6' },
        { quizPool: ['q4-pyr-1', 'q4-pyr-4'], rewardBlock: 'java4-f2' },
        { quizPool: ['q4-pyr-6', 'q4-pyr-2'], rewardBlock: 'java4-f1' },
        { quizPool: ['q4-pyr-8', 'q4-pyr-3'], rewardBlock: 'java4-f5' },
        { quizPool: ['q4-pyr-2', 'q4-pyr-7'], rewardBlock: 'java4-f3' },
      ],
    },
  },

  // ─── CHALLENGE 5 – GREATEST AMONG THREE NUMBERS ──────────────────────────
  {
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
