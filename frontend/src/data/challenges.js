/**
 * Mind Craft – Challenge Data
 *
 * Schema per challenge (per language):
 *   fragments[]   – array in CORRECT order (index 0 = first, last = last)
 *   revealOrder[] – fragment ids, order in which chests dispense them (shuffled from correct)
 *   chests[]      – one chest per fragment; chests[i] unlocks revealOrder[i]
 *   acceptedOrders[] – optional extra valid fragment-id orders beyond the canonical one
 *
 * quizzes{} – shared pool, keyed by quiz id, tagged by concept
 *   type: "mcq" | "output" | "fill"
 *   answer: number (mcq index) | string | string[] (fill)
 *   NOTE: answer/explain are NEVER exposed to the UI before the participant answers.
 *         In production, validation must move server-side.
 */

export const CHALLENGES = [
  // ─────────────────────────────────────────────────────────────────
  // CHALLENGE 5 – GREATEST AMONG THREE NUMBERS
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'ch-05',
    title: 'Challenge 5 – Greatest Among Three Numbers',
    subtitle: 'Conditionals & Maximum Logic',
    difficulty: 'Easy',
    points: 100,
    category: 'Conditionals & Logic',
    description:
      'Given three integers A, B, and C from standard input, determine and display the greatest (maximum) number among them.\n\nInput: Three integers separated by whitespace.\nOutput: A single integer representing the greatest value.',
    duration: 1200,
    sampleInput: '10 25 15',
    sampleOutput: '25',
    hiddenTests: [
      { id: 1, input: '10 25 15', expectedOutput: '25', description: 'Middle operand maximum' },
      { id: 2, input: '50 12 3', expectedOutput: '50', description: 'First operand maximum' },
      { id: 3, input: '7 9 99', expectedOutput: '99', description: 'Third operand maximum' },
      { id: 4, input: '-15 -5 -30', expectedOutput: '-5', description: 'All negative operands' },
      { id: 5, input: '42 42 42', expectedOutput: '42', description: 'All three operands equal' },
      { id: 6, input: '100 100 50', expectedOutput: '100', description: 'Two identical maximum operands' },
      { id: 7, input: '15 200 200', expectedOutput: '200', description: 'Last two identical maximum operands' },
      { id: 8, input: '0 0 -1', expectedOutput: '0', description: 'Zero boundary test' },
    ],

    languages: {
      python: {
        name: 'Python 3',
        fragments: [
          { id: 'py5-f1', code: 'import sys', role: 'MAIN_WRAPPER' },
          { id: 'py5-f2', code: 'tokens = sys.stdin.read().split()\na, b, c = int(tokens[0]), int(tokens[1]), int(tokens[2])', role: 'INPUT' },
          { id: 'py5-f3', code: 'if a >= b and a >= c:\n    ans = a\nelif b >= a and b >= c:\n    ans = b\nelse:\n    ans = c', role: 'LOGIC' },
          { id: 'py5-f4', code: 'print(ans)', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['py5-f1', 'py5-f2', 'py5-f3', 'py5-f4'],
        chests: [
          { id: 'py5-c1', quizPool: ['q5-entry-1', 'q5-entry-2'] },
          { id: 'py5-c2', quizPool: ['q5-input-1', 'q5-input-2'] },
          { id: 'py5-c3', quizPool: ['q5-logic-1', 'q5-logic-2'] },
          { id: 'py5-c4', quizPool: ['q5-out-1', 'q5-out-2'] },
        ],
      },

      cpp: {
        name: 'C++ 17',
        fragments: [
          { id: 'cpp5-f1', code: '#include <iostream>\nusing namespace std;\n\nint main() {', role: 'MAIN_WRAPPER' },
          { id: 'cpp5-f2', code: '    int a, b, c;\n    cin >> a >> b >> c;', role: 'INPUT' },
          { id: 'cpp5-f3', code: '    int maxVal;\n    if (a >= b && a >= c) {\n        maxVal = a;\n    } else if (b >= a && b >= c) {\n        maxVal = b;\n    } else {\n        maxVal = c;\n    }', role: 'LOGIC' },
          { id: 'cpp5-f4', code: '    cout << maxVal << endl;\n    return 0;\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['cpp5-f1', 'cpp5-f2', 'cpp5-f3', 'cpp5-f4'],
        chests: [
          { id: 'cpp5-c1', quizPool: ['q5-entry-1', 'q5-entry-2'] },
          { id: 'cpp5-c2', quizPool: ['q5-input-1', 'q5-input-2'] },
          { id: 'cpp5-c3', quizPool: ['q5-logic-1', 'q5-logic-2'] },
          { id: 'cpp5-c4', quizPool: ['q5-out-1', 'q5-out-2'] },
        ],
      },

      c: {
        name: 'C (GCC)',
        fragments: [
          { id: 'c5-f1', code: '#include <stdio.h>\n\nint main() {', role: 'MAIN_WRAPPER' },
          { id: 'c5-f2', code: '    int a, b, c;\n    scanf("%d %d %d", &a, &b, &c);', role: 'INPUT' },
          { id: 'c5-f3', code: '    int maxVal;\n    if (a >= b && a >= c) {\n        maxVal = a;\n    } else if (b >= a && b >= c) {\n        maxVal = b;\n    } else {\n        maxVal = c;\n    }', role: 'LOGIC' },
          { id: 'c5-f4', code: '    printf("%d\\n", maxVal);\n    return 0;\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['c5-f1', 'c5-f2', 'c5-f3', 'c5-f4'],
        chests: [
          { id: 'c5-c1', quizPool: ['q5-entry-1', 'q5-entry-2'] },
          { id: 'c5-c2', quizPool: ['q5-input-1', 'q5-input-2'] },
          { id: 'c5-c3', quizPool: ['q5-logic-1', 'q5-logic-2'] },
          { id: 'c5-c4', quizPool: ['q5-out-1', 'q5-out-2'] },
        ],
      },

      java: {
        name: 'Java 17',
        fragments: [
          { id: 'java5-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'MAIN_WRAPPER' },
          { id: 'java5-f2', code: '        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        int c = sc.nextInt();', role: 'INPUT' },
          { id: 'java5-f3', code: '        int maxVal;\n        if (a >= b && a >= c) {\n            maxVal = a;\n        } else if (b >= a && b >= c) {\n            maxVal = b;\n        } else {\n            maxVal = c;\n        }', role: 'LOGIC' },
          { id: 'java5-f4', code: '        System.out.println(maxVal);\n    }\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['java5-f1', 'java5-f2', 'java5-f3', 'java5-f4'],
        chests: [
          { id: 'java5-c1', quizPool: ['q5-entry-1', 'q5-entry-2'] },
          { id: 'java5-c2', quizPool: ['q5-input-1', 'q5-input-2'] },
          { id: 'java5-c3', quizPool: ['q5-logic-1', 'q5-logic-2'] },
          { id: 'java5-c4', quizPool: ['q5-out-1', 'q5-out-2'] },
        ],
      },
    },

    quizzes: {
      'q5-entry-1': {
        type: 'mcq',
        concept: 'imports',
        prompt: 'In C and C++, which header file provides standard input/output functions?',
        options: ['<stdio.h> / <iostream>', '<stdlib.h>', '<math.h>', '<string.h>'],
        answer: 0,
        explain: '<stdio.h> provides printf/scanf in C, and <iostream> provides cin/cout in C++.',
      },
      'q5-entry-2': {
        type: 'mcq',
        concept: 'java-entry',
        prompt: 'What is the signature of the entry point method in standard Java applications?',
        options: ['public static void main(String[] args)', 'public void start()', 'static main()', 'void run(int args)'],
        answer: 0,
        explain: 'The JVM requires public static void main(String[] args) as the application entry point.',
      },
      'q5-input-1': {
        type: 'mcq',
        concept: 'c-input',
        prompt: 'In C, which scanf statement correctly reads three integer variables a, b, and c?',
        options: ['scanf("%d %d %d", &a, &b, &c);', 'scanf("%d", a, b, c);', 'cin >> a >> b >> c;', 'input(a, b, c);'],
        answer: 0,
        explain: 'scanf requires the "%d" format specifier and the address-of operator (&) for each variable.',
      },
      'q5-input-2': {
        type: 'mcq',
        concept: 'java-input',
        prompt: 'In Java, which method of the Scanner class reads the next integer token from input?',
        options: ['nextInt()', 'readInt()', 'next()', 'parseInteger()'],
        answer: 0,
        explain: '`Scanner.nextInt()` extracts the next integer token separated by whitespace.',
      },
      'q5-logic-1': {
        type: 'mcq',
        concept: 'operators',
        prompt: 'Which logical operator is used to verify that A is greater than or equal to BOTH B and C?',
        options: ['&& (Logical AND)', '|| (Logical OR)', '! (Logical NOT)', '^ (Bitwise XOR)'],
        answer: 0,
        explain: 'The logical AND operator (&& in C/C++/Java, `and` in Python) requires both conditions to evaluate to true.',
      },
      'q5-logic-2': {
        type: 'output',
        concept: 'negative-numbers',
        prompt: 'What is the greatest value among A = -15, B = -5, and C = -30?',
        answer: '-5',
        explain: '-5 is closest to zero on the number line, making it the greatest negative value.',
      },
      'q5-out-1': {
        type: 'mcq',
        concept: 'cpp-output',
        prompt: 'In C++, which stream manipulator advances the cursor to the next line and flushes the stream?',
        options: ['endl', 'flush', 'newline', 'break'],
        answer: 0,
        explain: '`endl` inserts a newline character into the output stream and flushes the buffer.',
      },
      'q5-out-2': {
        type: 'mcq',
        concept: 'python-output',
        prompt: 'In Python, what is the default behavior of `print()` after displaying arguments?',
        options: ['Appends a newline character (\\n)', 'Does not add any character', 'Appends a space', 'Terminates the program'],
        answer: 0,
        explain: 'Python `print()` ends with a newline character by default unless overridden with `end=...`.',
      },
    },
  },
];
