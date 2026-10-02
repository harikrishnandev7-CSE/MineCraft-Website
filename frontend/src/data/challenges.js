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
  // CHALLENGE 1 – FIND THE SUM
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'ch-01',
    title: 'Challenge 1 – Find the Sum',
    subtitle: 'Sum of First N Natural Numbers',
    difficulty: 'Medium',
    points: 100,
    category: 'Math & Accumulation',
    description:
      'Given a positive integer N from standard input, calculate and display the total sum of all natural numbers from 1 up to N (inclusive).\n\nFormula: Sum = 1 + 2 + 3 + ... + N',
    duration: 1200,
    sampleInput: '5',
    sampleOutput: '15',
    hiddenTests: [
      { id: 1, input: '5',  expectedOutput: '15',  description: 'Base sample test' },
      { id: 2, input: '10', expectedOutput: '55',  description: 'Mid-range accumulation' },
      { id: 3, input: '20', expectedOutput: '210', description: 'Upper bound validation' },
    ],

    languages: {
      python: {
        name: 'Python 3',
        fragments: [
          { id: 'py1-f1', code: 'n = int(input().strip())', role: 'INPUT' },
          { id: 'py1-f2', code: 'total = 0\nfor i in range(1, n + 1):\n    total += i', role: 'LOGIC' },
          { id: 'py1-f3', code: 'print(total)', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['py1-f3', 'py1-f1', 'py1-f2'],
        chests: [
          { id: 'py1-c1', quizPool: ['q1-sum-1', 'q1-sum-2'] },
          { id: 'py1-c2', quizPool: ['q1-sum-3', 'q1-sum-4'] },
          { id: 'py1-c3', quizPool: ['q1-sum-5', 'q1-sum-6'] },
        ],
      },

      cpp: {
        name: 'C++ 17',
        fragments: [
          { id: 'cpp1-f1', code: '#include <iostream>\nusing namespace std;', role: 'IMPORT' },
          { id: 'cpp1-f2', code: 'int main() {\n    int n, total = 0;\n    cin >> n;', role: 'INPUT' },
          { id: 'cpp1-f3', code: '    for (int i = 1; i <= n; i++) {\n        total += i;\n    }', role: 'LOGIC' },
          { id: 'cpp1-f4', code: '    cout << total << endl;', role: 'OUTPUT' },
          { id: 'cpp1-f5', code: '    return 0;\n}', role: 'CLOSE' },
        ],
        acceptedOrders: [],
        revealOrder: ['cpp1-f4', 'cpp1-f1', 'cpp1-f3', 'cpp1-f5', 'cpp1-f2'],
        chests: [
          { id: 'cpp1-c1', quizPool: ['q1-sum-7', 'q1-sum-8'] },
          { id: 'cpp1-c2', quizPool: ['q1-sum-1', 'q1-sum-3'] },
          { id: 'cpp1-c3', quizPool: ['q1-sum-5', 'q1-sum-9'] },
          { id: 'cpp1-c4', quizPool: ['q1-sum-2', 'q1-sum-6'] },
          { id: 'cpp1-c5', quizPool: ['q1-sum-4', 'q1-sum-7'] },
        ],
      },

      c: {
        name: 'C (GCC)',
        fragments: [
          { id: 'c1-f1', code: '#include <stdio.h>', role: 'IMPORT' },
          { id: 'c1-f2', code: 'int main() {\n    int n, total = 0;\n    scanf("%d", &n);', role: 'INPUT' },
          { id: 'c1-f3', code: '    for (int i = 1; i <= n; i++) {\n        total += i;\n    }', role: 'LOGIC' },
          { id: 'c1-f4', code: '    printf("%d\\n", total);', role: 'OUTPUT' },
          { id: 'c1-f5', code: '    return 0;\n}', role: 'CLOSE' },
        ],
        acceptedOrders: [],
        revealOrder: ['c1-f3', 'c1-f5', 'c1-f1', 'c1-f4', 'c1-f2'],
        chests: [
          { id: 'c1-c1', quizPool: ['q1-sum-1', 'q1-sum-8'] },
          { id: 'c1-c2', quizPool: ['q1-sum-7', 'q1-sum-3'] },
          { id: 'c1-c3', quizPool: ['q1-sum-5', 'q1-sum-2'] },
          { id: 'c1-c4', quizPool: ['q1-sum-6', 'q1-sum-9'] },
          { id: 'c1-c5', quizPool: ['q1-sum-4', 'q1-sum-1'] },
        ],
      },

      java: {
        name: 'Java 11',
        fragments: [
          { id: 'java1-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER' },
          { id: 'java1-f2', code: '        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int total = 0;', role: 'INPUT' },
          { id: 'java1-f3', code: '        for (int i = 1; i <= n; i++) {\n            total += i;\n        }', role: 'LOGIC' },
          { id: 'java1-f4', code: '        System.out.println(total);', role: 'OUTPUT' },
          { id: 'java1-f5', code: '    }\n}', role: 'CLOSE' },
        ],
        acceptedOrders: [],
        revealOrder: ['java1-f4', 'java1-f2', 'java1-f5', 'java1-f1', 'java1-f3'],
        chests: [
          { id: 'java1-c1', quizPool: ['q1-sum-9', 'q1-sum-1'] },
          { id: 'java1-c2', quizPool: ['q1-sum-7', 'q1-sum-4'] },
          { id: 'java1-c3', quizPool: ['q1-sum-3', 'q1-sum-8'] },
          { id: 'java1-c4', quizPool: ['q1-sum-2', 'q1-sum-5'] },
          { id: 'java1-c5', quizPool: ['q1-sum-6', 'q1-sum-9'] },
        ],
      },
    },

    quizzes: {
      'q1-sum-1': {
        type: 'mcq',
        concept: 'loops',
        prompt: 'How many times does `for i in range(1, n + 1)` iterate when n = 5?',
        options: ['4', '5', '6', 'n + 1'],
        answer: 1,
        explain: 'range(1, 6) yields 1, 2, 3, 4, 5 → 5 iterations.',
      },
      'q1-sum-2': {
        type: 'output',
        concept: 'accumulation',
        prompt: 'What does this print?\n\ntotal = 0\nfor i in range(1, 4):\n    total += i\nprint(total)',
        answer: '6',
        explain: '1 + 2 + 3 = 6.',
      },
      'q1-sum-3': {
        type: 'fill',
        concept: 'syntax',
        prompt: 'Complete the line: `total ___ i`  (adds i to total each iteration)',
        answer: ['+=', '+= i'],
        explain: '+= is the addition-assignment operator.',
      },
      'q1-sum-4': {
        type: 'mcq',
        concept: 'accumulation',
        prompt: 'Which variable holds the running sum in the Python solution?',
        options: ['n', 'i', 'total', 'result'],
        answer: 2,
        explain: '`total` is initialised to 0 and accumulated with each i.',
      },
      'q1-sum-5': {
        type: 'mcq',
        concept: 'input',
        prompt: 'Which function reads N as an integer from stdin in Python?',
        options: ['input()', 'int(input())', 'read()', 'scan()'],
        answer: 1,
        explain: 'int(input()) reads the string and converts it.',
      },
      'q1-sum-6': {
        type: 'output',
        concept: 'loops',
        prompt: 'What is printed?\n\ntotal = 0\nfor i in range(1, 6):\n    total += i\nprint(total)',
        answer: '15',
        explain: '1+2+3+4+5 = 15.',
      },
      'q1-sum-7': {
        type: 'mcq',
        concept: 'cpp-syntax',
        prompt: 'In C++, which statement reads an integer from stdin?',
        options: ['scanf("%d",&n)', 'cin >> n', 'gets(n)', 'readline(n)'],
        answer: 1,
        explain: '`cin >> n` extracts an integer from standard input in C++.',
      },
      'q1-sum-8': {
        type: 'fill',
        concept: 'loops',
        prompt: 'Fill in the blank: `for (int i = 1; i ___ n; i++)` to iterate from 1 to N inclusive.',
        answer: ['<=', '< n + 1'],
        explain: 'Using <= n ensures i reaches n on the last iteration.',
      },
      'q1-sum-9': {
        type: 'mcq',
        concept: 'java-syntax',
        prompt: 'In Java, which class is used to read integers from stdin?',
        options: ['System.in', 'BufferedReader', 'Scanner', 'InputStreamReader'],
        answer: 2,
        explain: '`Scanner sc = new Scanner(System.in)` is the idiomatic Java approach.',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // CHALLENGE 2 – REVERSE A STRING
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'ch-02',
    title: 'Challenge 2 – Reverse a String',
    subtitle: 'String Inversion Algorithm',
    difficulty: 'Easy',
    points: 100,
    category: 'Strings & Pointers',
    description:
      "Read an input word or sequence of characters from standard input and print the exact reversed string.\n\nExample: 'hello' becomes 'olleh'.",
    duration: 1200,
    sampleInput: 'hello',
    sampleOutput: 'olleh',
    hiddenTests: [
      { id: 1, input: 'mindcraft',  expectedOutput: 'tfardcnim', description: 'Platform name reversal' },
      { id: 2, input: 'racecar',   expectedOutput: 'racecar',   description: 'Palindrome preservation' },
      { id: 3, input: 'algorithm', expectedOutput: 'mihtirogla', description: 'General vocabulary' },
    ],

    languages: {
      python: {
        name: 'Python 3',
        fragments: [
          { id: 'py2-f1', code: 's = input().strip()', role: 'INPUT' },
          { id: 'py2-f2', code: 'rev = s[::-1]', role: 'LOGIC' },
          { id: 'py2-f3', code: 'print(rev)', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['py2-f2', 'py2-f3', 'py2-f1'],
        chests: [
          { id: 'py2-c1', quizPool: ['q2-rev-1', 'q2-rev-2'] },
          { id: 'py2-c2', quizPool: ['q2-rev-3', 'q2-rev-4'] },
          { id: 'py2-c3', quizPool: ['q2-rev-5', 'q2-rev-6'] },
        ],
      },

      cpp: {
        name: 'C++ 17',
        fragments: [
          { id: 'cpp2-f1', code: '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;', role: 'IMPORT' },
          { id: 'cpp2-f2', code: 'int main() {\n    string s;\n    cin >> s;', role: 'INPUT' },
          { id: 'cpp2-f3', code: '    reverse(s.begin(), s.end());', role: 'LOGIC' },
          { id: 'cpp2-f4', code: '    cout << s << endl;\n    return 0;\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['cpp2-f3', 'cpp2-f1', 'cpp2-f4', 'cpp2-f2'],
        chests: [
          { id: 'cpp2-c1', quizPool: ['q2-rev-7', 'q2-rev-1'] },
          { id: 'cpp2-c2', quizPool: ['q2-rev-2', 'q2-rev-8'] },
          { id: 'cpp2-c3', quizPool: ['q2-rev-3', 'q2-rev-5'] },
          { id: 'cpp2-c4', quizPool: ['q2-rev-6', 'q2-rev-4'] },
        ],
      },

      c: {
        name: 'C (GCC)',
        fragments: [
          { id: 'c2-f1', code: '#include <stdio.h>\n#include <string.h>', role: 'IMPORT' },
          { id: 'c2-f2', code: 'int main() {\n    char s[1000];\n    scanf("%s", s);', role: 'INPUT' },
          { id: 'c2-f3', code: '    int len = strlen(s);\n    for (int i = 0; i < len / 2; i++) {\n        char tmp = s[i];\n        s[i] = s[len - 1 - i];\n        s[len - 1 - i] = tmp;\n    }', role: 'LOGIC' },
          { id: 'c2-f4', code: '    printf("%s\\n", s);\n    return 0;\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['c2-f4', 'c2-f2', 'c2-f1', 'c2-f3'],
        chests: [
          { id: 'c2-c1', quizPool: ['q2-rev-1', 'q2-rev-7'] },
          { id: 'c2-c2', quizPool: ['q2-rev-8', 'q2-rev-4'] },
          { id: 'c2-c3', quizPool: ['q2-rev-3', 'q2-rev-6'] },
          { id: 'c2-c4', quizPool: ['q2-rev-2', 'q2-rev-5'] },
        ],
      },

      java: {
        name: 'Java 11',
        fragments: [
          { id: 'java2-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER' },
          { id: 'java2-f2', code: '        Scanner sc = new Scanner(System.in);\n        String s = sc.next();', role: 'INPUT' },
          { id: 'java2-f3', code: '        StringBuilder sb = new StringBuilder(s);\n        String rev = sb.reverse().toString();', role: 'LOGIC' },
          { id: 'java2-f4', code: '        System.out.println(rev);\n    }\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['java2-f3', 'java2-f4', 'java2-f1', 'java2-f2'],
        chests: [
          { id: 'java2-c1', quizPool: ['q2-rev-5', 'q2-rev-2'] },
          { id: 'java2-c2', quizPool: ['q2-rev-8', 'q2-rev-1'] },
          { id: 'java2-c3', quizPool: ['q2-rev-6', 'q2-rev-3'] },
          { id: 'java2-c4', quizPool: ['q2-rev-4', 'q2-rev-7'] },
        ],
      },
    },

    quizzes: {
      'q2-rev-1': {
        type: 'mcq',
        concept: 'slicing',
        prompt: 'In Python, `s[::-1]` on a string "hello" returns:',
        options: ['"hello"', '"olleh"', '"hell"', 'Error'],
        answer: 1,
        explain: 'Slice step -1 traverses characters from end to start.',
      },
      'q2-rev-2': {
        type: 'output',
        concept: 'slicing',
        prompt: 'What does this print?\n\ns = "abc"\nprint(s[::-1])',
        answer: 'cba',
        explain: 'Reversed slice: c, b, a.',
      },
      'q2-rev-3': {
        type: 'fill',
        concept: 'syntax',
        prompt: 'Complete: `rev = s[___]`  to reverse string s in Python',
        answer: ['::-1', ':: -1'],
        explain: 's[::-1] uses extended slice with step -1.',
      },
      'q2-rev-4': {
        type: 'mcq',
        concept: 'string-ops',
        prompt: 'Which C++ function reverses a string in-place?',
        options: ['str.flip()', 'reverse(s.begin(), s.end())', 'strrev(s)', 's.invert()'],
        answer: 1,
        explain: 'std::reverse from <algorithm> reverses iterators in-place.',
      },
      'q2-rev-5': {
        type: 'mcq',
        concept: 'java-ops',
        prompt: 'Which Java class has a `.reverse()` method for strings?',
        options: ['String', 'StringBuffer', 'StringBuilder', 'Both B and C'],
        answer: 3,
        explain: 'Both StringBuffer and StringBuilder have .reverse().',
      },
      'q2-rev-6': {
        type: 'output',
        concept: 'string-ops',
        prompt: 'What does this Java code print?\n\nString s = "hi";\nStringBuilder sb = new StringBuilder(s);\nSystem.out.println(sb.reverse().toString());',
        answer: 'ih',
        explain: 'StringBuilder.reverse() reverses the character sequence.',
      },
      'q2-rev-7': {
        type: 'mcq',
        concept: 'c-ops',
        prompt: 'Which C function returns the length of a C-string?',
        options: ['len(s)', 'sizeof(s)', 'strlen(s)', 'length(s)'],
        answer: 2,
        explain: 'strlen() from <string.h> counts characters up to null terminator.',
      },
      'q2-rev-8': {
        type: 'fill',
        concept: 'loops',
        prompt: 'In the C swap-based reversal loop, the loop runs while `i < ___`.',
        answer: ['len / 2', 'len/2'],
        explain: 'Only need to swap up to the midpoint; beyond that the string is mirrored.',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // CHALLENGE 3 – FIND THE LARGEST NUMBER
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'ch-03',
    title: 'Challenge 3 – Find the Largest Number',
    subtitle: 'Array Peak Element Search',
    difficulty: 'Hard',
    points: 120,
    category: 'Array Traversal',
    description:
      'Given space-separated integers on standard input, determine and print the maximum (largest) integer in the sequence.',
    duration: 1200,
    sampleInput: '3 8 2 15 6',
    sampleOutput: '15',
    hiddenTests: [
      { id: 1, input: '10 45 2 99 31',       expectedOutput: '99',  description: 'Multi-element sequence' },
      { id: 2, input: '-5 -1 -20 -3',        expectedOutput: '-1', description: 'Negative integers handling' },
      { id: 3, input: '100 200 50 400 150',  expectedOutput: '400', description: 'Triple digit values' },
    ],

    languages: {
      python: {
        name: 'Python 3',
        fragments: [
          { id: 'py3-f1', code: 'nums = list(map(int, input().split()))', role: 'INPUT' },
          { id: 'py3-f2', code: 'max_val = nums[0]', role: 'INIT' },
          { id: 'py3-f3', code: 'for x in nums[1:]:\n    if x > max_val:\n        max_val = x', role: 'LOGIC' },
          { id: 'py3-f4', code: 'print(max_val)', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['py3-f3', 'py3-f1', 'py3-f4', 'py3-f2'],
        chests: [
          { id: 'py3-c1', quizPool: ['q3-max-1', 'q3-max-2'] },
          { id: 'py3-c2', quizPool: ['q3-max-3', 'q3-max-4'] },
          { id: 'py3-c3', quizPool: ['q3-max-5', 'q3-max-6'] },
          { id: 'py3-c4', quizPool: ['q3-max-7', 'q3-max-1'] },
        ],
      },

      cpp: {
        name: 'C++ 17',
        fragments: [
          { id: 'cpp3-f1', code: '#include <iostream>\nusing namespace std;', role: 'IMPORT' },
          { id: 'cpp3-f2', code: 'int main() {\n    int x, max_val;\n    cin >> max_val;', role: 'INIT' },
          { id: 'cpp3-f3', code: '    while (cin >> x) {\n        if (x > max_val) max_val = x;\n    }', role: 'LOGIC' },
          { id: 'cpp3-f4', code: '    cout << max_val << endl;\n    return 0;\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['cpp3-f3', 'cpp3-f4', 'cpp3-f1', 'cpp3-f2'],
        chests: [
          { id: 'cpp3-c1', quizPool: ['q3-max-7', 'q3-max-3'] },
          { id: 'cpp3-c2', quizPool: ['q3-max-1', 'q3-max-5'] },
          { id: 'cpp3-c3', quizPool: ['q3-max-6', 'q3-max-2'] },
          { id: 'cpp3-c4', quizPool: ['q3-max-4', 'q3-max-8'] },
        ],
      },

      c: {
        name: 'C (GCC)',
        fragments: [
          { id: 'c3-f1', code: '#include <stdio.h>', role: 'IMPORT' },
          { id: 'c3-f2', code: 'int main() {\n    int x, max_val;\n    scanf("%d", &max_val);', role: 'INIT' },
          { id: 'c3-f3', code: '    while (scanf("%d", &x) == 1) {\n        if (x > max_val) max_val = x;\n    }', role: 'LOGIC' },
          { id: 'c3-f4', code: '    printf("%d\\n", max_val);\n    return 0;\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['c3-f2', 'c3-f4', 'c3-f3', 'c3-f1'],
        chests: [
          { id: 'c3-c1', quizPool: ['q3-max-2', 'q3-max-8'] },
          { id: 'c3-c2', quizPool: ['q3-max-6', 'q3-max-1'] },
          { id: 'c3-c3', quizPool: ['q3-max-3', 'q3-max-5'] },
          { id: 'c3-c4', quizPool: ['q3-max-7', 'q3-max-4'] },
        ],
      },

      java: {
        name: 'Java 11',
        fragments: [
          { id: 'java3-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER' },
          { id: 'java3-f2', code: '        Scanner sc = new Scanner(System.in);\n        int maxVal = sc.nextInt();', role: 'INIT' },
          { id: 'java3-f3', code: '        while (sc.hasNextInt()) {\n            int x = sc.nextInt();\n            if (x > maxVal) maxVal = x;\n        }', role: 'LOGIC' },
          { id: 'java3-f4', code: '        System.out.println(maxVal);\n    }\n}', role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['java3-f4', 'java3-f3', 'java3-f1', 'java3-f2'],
        chests: [
          { id: 'java3-c1', quizPool: ['q3-max-5', 'q3-max-7'] },
          { id: 'java3-c2', quizPool: ['q3-max-3', 'q3-max-8'] },
          { id: 'java3-c3', quizPool: ['q3-max-1', 'q3-max-2'] },
          { id: 'java3-c4', quizPool: ['q3-max-6', 'q3-max-4'] },
        ],
      },
    },

    quizzes: {
      'q3-max-1': {
        type: 'mcq',
        concept: 'comparison',
        prompt: 'Which Python expression correctly checks if x is greater than max_val?',
        options: ['x == max_val', 'x > max_val', 'x >= max_val', 'max_val > x'],
        answer: 1,
        explain: 'x > max_val is true when x is strictly greater.',
      },
      'q3-max-2': {
        type: 'output',
        concept: 'traversal',
        prompt: 'What does this print?\n\nnums = [3, 8, 2, 15, 6]\nmax_val = nums[0]\nfor x in nums[1:]:\n    if x > max_val:\n        max_val = x\nprint(max_val)',
        answer: '15',
        explain: '15 is the largest element.',
      },
      'q3-max-3': {
        type: 'fill',
        concept: 'init',
        prompt: 'To start the max search in Python, we initialise max_val with `nums[___]` to avoid assuming the range.',
        answer: ['0', '[0]'],
        explain: 'nums[0] safely seeds max_val with the first element.',
      },
      'q3-max-4': {
        type: 'mcq',
        concept: 'loops',
        prompt: 'In `for x in nums[1:]:` why do we start at index 1?',
        options: [
          'To skip the last element',
          'Because index 0 is already used as the initial max',
          'Python lists start at 1',
          'To avoid an off-by-one error in the output',
        ],
        answer: 1,
        explain: 'Index 0 is used to seed max_val, so we compare from index 1 onward.',
      },
      'q3-max-5': {
        type: 'mcq',
        concept: 'cpp-input',
        prompt: 'In C++, `while (cin >> x)` reads integers until:',
        options: ['x == 0', 'EOF or invalid input', 'x > 1000', 'The loop runs 10 times'],
        answer: 1,
        explain: 'cin >> x returns false on EOF or read failure.',
      },
      'q3-max-6': {
        type: 'output',
        concept: 'negative-nums',
        prompt: 'What does this print?\n\nnums = [-5, -1, -20, -3]\nmax_val = nums[0]\nfor x in nums[1:]:\n    if x > max_val:\n        max_val = x\nprint(max_val)',
        answer: '-1',
        explain: '-1 is the largest among all negative values.',
      },
      'q3-max-7': {
        type: 'fill',
        concept: 'c-scanf',
        prompt: 'In C, `while (scanf("%d", &x) ___ 1)` reads integers until EOF.',
        answer: ['== 1', '==1'],
        explain: 'scanf returns the number of items read; == 1 means one integer was read successfully.',
      },
      'q3-max-8': {
        type: 'mcq',
        concept: 'java-scanner',
        prompt: 'In Java, `sc.hasNextInt()` returns:',
        options: [
          'The next integer',
          'True if the next token is an integer, false otherwise',
          'The count of remaining integers',
          'True only if the Scanner is at EOF',
        ],
        answer: 1,
        explain: 'hasNextInt() peeks ahead without consuming, returns boolean.',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // CHALLENGE 4 – STAR PYRAMID
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'ch-04',
    title: 'Challenge 4 – Star Pyramid',
    subtitle: 'Nested Loop Pattern Printing',
    difficulty: 'Hard',
    points: 150,
    category: 'Nested Loops & Patterns',
    description:
      'Given a positive integer N from standard input, print a left-aligned star pyramid of N rows.\n\nRow i (1-indexed) contains exactly i stars.\n\nExample for N=4:\n*\n**\n***\n****',
    duration: 1200,
    sampleInput: '4',
    sampleOutput: '*\n**\n***\n****',
    hiddenTests: [
      { id: 1, input: '4', expectedOutput: '*\n**\n***\n****',             description: 'Basic pyramid 4 rows' },
      { id: 2, input: '1', expectedOutput: '*',                           description: 'Single row edge case' },
      { id: 3, input: '6', expectedOutput: '*\n**\n***\n****\n*****\n******', description: 'Six-row pyramid' },
    ],

    languages: {
      python: {
        name: 'Python 3',
        fragments: [
          { id: 'py4-f1', code: 'n = int(input().strip())', role: 'INPUT' },
          { id: 'py4-f2', code: 'for i in range(1, n + 1):', role: 'OUTER_LOOP' },
          { id: 'py4-f3', code: "    print('*' * i)", role: 'OUTPUT' },
        ],
        acceptedOrders: [],
        revealOrder: ['py4-f3', 'py4-f1', 'py4-f2'],
        chests: [
          { id: 'py4-c1', quizPool: ['q4-pyr-1', 'q4-pyr-2'] },
          { id: 'py4-c2', quizPool: ['q4-pyr-3', 'q4-pyr-4'] },
          { id: 'py4-c3', quizPool: ['q4-pyr-5', 'q4-pyr-6'] },
        ],
      },

      cpp: {
        name: 'C++ 17',
        fragments: [
          { id: 'cpp4-f1', code: '#include <iostream>\nusing namespace std;', role: 'IMPORT' },
          { id: 'cpp4-f2', code: 'int main() {\n    int n;\n    cin >> n;', role: 'INPUT' },
          { id: 'cpp4-f3', code: '    for (int i = 1; i <= n; i++) {', role: 'OUTER_LOOP' },
          { id: 'cpp4-f4', code: '        for (int j = 0; j < i; j++) {\n            cout << "*";\n        }', role: 'INNER_LOOP' },
          { id: 'cpp4-f5', code: '        cout << endl;\n    }', role: 'ROW_END' },
          { id: 'cpp4-f6', code: '    return 0;\n}', role: 'CLOSE' },
        ],
        acceptedOrders: [],
        revealOrder: ['cpp4-f4', 'cpp4-f1', 'cpp4-f6', 'cpp4-f3', 'cpp4-f2', 'cpp4-f5'],
        chests: [
          { id: 'cpp4-c1', quizPool: ['q4-pyr-7', 'q4-pyr-2'] },
          { id: 'cpp4-c2', quizPool: ['q4-pyr-1', 'q4-pyr-8'] },
          { id: 'cpp4-c3', quizPool: ['q4-pyr-3', 'q4-pyr-6'] },
          { id: 'cpp4-c4', quizPool: ['q4-pyr-5', 'q4-pyr-4'] },
          { id: 'cpp4-c5', quizPool: ['q4-pyr-8', 'q4-pyr-7'] },
          { id: 'cpp4-c6', quizPool: ['q4-pyr-4', 'q4-pyr-1'] },
        ],
      },

      c: {
        name: 'C (GCC)',
        fragments: [
          { id: 'c4-f1', code: '#include <stdio.h>', role: 'IMPORT' },
          { id: 'c4-f2', code: 'int main() {\n    int n;\n    scanf("%d", &n);', role: 'INPUT' },
          { id: 'c4-f3', code: '    for (int i = 1; i <= n; i++) {', role: 'OUTER_LOOP' },
          { id: 'c4-f4', code: '        for (int j = 0; j < i; j++) {\n            printf("*");\n        }', role: 'INNER_LOOP' },
          { id: 'c4-f5', code: '        printf("\\n");\n    }', role: 'ROW_END' },
          { id: 'c4-f6', code: '    return 0;\n}', role: 'CLOSE' },
        ],
        acceptedOrders: [],
        revealOrder: ['c4-f5', 'c4-f3', 'c4-f1', 'c4-f4', 'c4-f6', 'c4-f2'],
        chests: [
          { id: 'c4-c1', quizPool: ['q4-pyr-2', 'q4-pyr-7'] },
          { id: 'c4-c2', quizPool: ['q4-pyr-8', 'q4-pyr-3'] },
          { id: 'c4-c3', quizPool: ['q4-pyr-1', 'q4-pyr-5'] },
          { id: 'c4-c4', quizPool: ['q4-pyr-4', 'q4-pyr-6'] },
          { id: 'c4-c5', quizPool: ['q4-pyr-7', 'q4-pyr-2'] },
          { id: 'c4-c6', quizPool: ['q4-pyr-6', 'q4-pyr-8'] },
        ],
      },

      java: {
        name: 'Java 11',
        fragments: [
          { id: 'java4-f1', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {', role: 'WRAPPER' },
          { id: 'java4-f2', code: '        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();', role: 'INPUT' },
          { id: 'java4-f3', code: '        for (int i = 1; i <= n; i++) {', role: 'OUTER_LOOP' },
          { id: 'java4-f4', code: '            for (int j = 0; j < i; j++) {\n                System.out.print("*");\n            }', role: 'INNER_LOOP' },
          { id: 'java4-f5', code: '            System.out.println();', role: 'ROW_END' },
          { id: 'java4-f6', code: '        }\n    }\n}', role: 'CLOSE' },
        ],
        acceptedOrders: [],
        revealOrder: ['java4-f4', 'java4-f6', 'java4-f2', 'java4-f1', 'java4-f5', 'java4-f3'],
        chests: [
          { id: 'java4-c1', quizPool: ['q4-pyr-3', 'q4-pyr-8'] },
          { id: 'java4-c2', quizPool: ['q4-pyr-7', 'q4-pyr-5'] },
          { id: 'java4-c3', quizPool: ['q4-pyr-1', 'q4-pyr-4'] },
          { id: 'java4-c4', quizPool: ['q4-pyr-6', 'q4-pyr-2'] },
          { id: 'java4-c5', quizPool: ['q4-pyr-8', 'q4-pyr-3'] },
          { id: 'java4-c6', quizPool: ['q4-pyr-2', 'q4-pyr-7'] },
        ],
      },
    },

    quizzes: {
      'q4-pyr-1': {
        type: 'mcq',
        concept: 'nested-loops',
        prompt: 'In a star pyramid, how many stars appear on row i (1-indexed)?',
        options: ['i - 1', 'i', 'i + 1', 'n - i'],
        answer: 1,
        explain: 'Row 1 has 1 star, row 2 has 2 stars, ..., row i has i stars.',
      },
      'q4-pyr-2': {
        type: 'output',
        concept: 'pattern',
        prompt: "What does `print('*' * 3)` output in Python?",
        answer: '***',
        explain: "String multiplication repeats '*' three times.",
      },
      'q4-pyr-3': {
        type: 'mcq',
        concept: 'outer-loop',
        prompt: 'The outer loop in a star pyramid iterates over:',
        options: ['Number of stars per row', 'Row number (1 to N)', 'Column count', 'Diagonal index'],
        answer: 1,
        explain: 'The outer loop runs from row 1 to N, one iteration per row.',
      },
      'q4-pyr-4': {
        type: 'fill',
        concept: 'inner-loop',
        prompt: 'Fill the blank: `for (int j = 0; j < ___; j++)` to print i stars on row i in C++.',
        answer: ['i', 'i;'],
        explain: 'j < i means j takes values 0, 1, ..., i-1 → i iterations.',
      },
      'q4-pyr-5': {
        type: 'output',
        concept: 'nested-loops',
        prompt: 'How many total stars are printed for N = 3?',
        answer: '6',
        explain: 'Row 1: 1 star, row 2: 2 stars, row 3: 3 stars → 1+2+3 = 6.',
      },
      'q4-pyr-6': {
        type: 'mcq',
        concept: 'newline',
        prompt: 'After printing stars on a row in C++, you call:',
        options: ['cout << "\\n"', 'cout << endl', 'printf("\\n")', 'Both A and B'],
        answer: 3,
        explain: 'Both cout << "\\n" and cout << endl advance to the next line in C++.',
      },
      'q4-pyr-7': {
        type: 'mcq',
        concept: 'java-output',
        prompt: 'In Java, `System.out.print("*")` vs `System.out.println("*")`:',
        options: [
          'Both add a newline after *',
          'print does NOT add a newline; println does',
          'println does NOT add a newline; print does',
          'Both are identical',
        ],
        answer: 1,
        explain: 'print appends nothing; println appends the platform newline.',
      },
      'q4-pyr-8': {
        type: 'fill',
        concept: 'outer-loop-bound',
        prompt: 'Fill: `for i in range(1, ___ + 1):` to loop row numbers 1 through N in Python.',
        answer: ['n', 'N'],
        explain: 'range(1, n + 1) generates 1, 2, ..., n.',
      },
    },
  },
];
