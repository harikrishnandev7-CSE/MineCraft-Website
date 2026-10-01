export const CHALLENGES = [
  {
    id: "ch-01",
    title: "Challenge 1 – Find the Sum",
    subtitle: "Sum of First N Natural Numbers",
    difficulty: "Medium",
    points: 100,
    category: "Math & Accumulation",
    description: "Given a positive integer N from standard input, calculate and display the total sum of all natural numbers from 1 up to N (inclusive).\n\nFormula: Sum = 1 + 2 + 3 + ... + N",
    duration: 1200, // 20 minutes
    sampleInput: "5",
    sampleOutput: "15",
    hiddenTests: [
      { id: 1, input: "5", expectedOutput: "15", description: "Base sample test" },
      { id: 2, input: "10", expectedOutput: "55", description: "Mid-range accumulation" },
      { id: 3, input: "20", expectedOutput: "210", description: "Upper bound validation" },
    ],
    languages: {
      python: {
        name: "Python 3",
        blocks: [
          { blockId: "B01", code: "# Read input integer N\nn = int(input().strip())", correctOrder: 1, type: "INPUT", hint: "Parse standard input" },
          { blockId: "B02", code: "# Initialize accumulator sum\ntotal = 0", correctOrder: 2, type: "INIT", hint: "Variable initialization" },
          { blockId: "B03", code: "for i in range(1, n + 1):", correctOrder: 3, type: "LOOP", hint: "Iteration head" },
          { blockId: "B04", code: "    total += i", correctOrder: 4, type: "LOGIC", hint: "Accumulate current index" },
          { blockId: "B05", code: "print(total)", correctOrder: 5, type: "OUTPUT", hint: "Display computed total" },
          { blockId: "B06", code: "    total -= i  # DECOY", isDecoy: true, correctOrder: 99, type: "DECOY", hint: "Distractor block" },
          { blockId: "B07", code: "while total < 0: pass  # DECOY", isDecoy: true, correctOrder: 98, type: "DECOY", hint: "Infinite loop trap" },
          { blockId: "B08", code: "# Verification complete", correctOrder: 6, isDecoy: false, type: "COMMENT", hint: "End of stream" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B03", token: "MC-CH01-B03-K9X2" },
          { qrId: "QR-02", blockId: "B01", token: "MC-CH01-B01-A4P7" },
          { qrId: "QR-03", blockId: "B05", token: "MC-CH01-B05-M1L8" },
          { qrId: "QR-04", blockId: "B02", token: "MC-CH01-B02-T7V3" },
          { qrId: "QR-05", blockId: "B06", token: "MC-CH01-B06-D9R1" }, // Decoy
          { qrId: "QR-06", blockId: "B04", token: "MC-CH01-B04-F2W5" },
          { qrId: "QR-07", blockId: "B07", token: "MC-CH01-B07-Z8H4" }, // Decoy
          { qrId: "QR-08", blockId: "B08", token: "MC-CH01-B08-Q3Y6" },
        ]
      },
      cpp: {
        name: "C++ 17",
        blocks: [
          { blockId: "B01", code: "#include <iostream>\nusing namespace std;", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "int main() {\n    int n, total = 0;", correctOrder: 2, type: "INIT" },
          { blockId: "B03", code: "    if (!(cin >> n)) return 0;", correctOrder: 3, type: "INPUT" },
          { blockId: "B04", code: "    for (int i = 1; i <= n; i++) {\n        total += i;\n    }", correctOrder: 4, type: "LOOP" },
          { blockId: "B05", code: "    cout << total << endl;\n    return 0;\n}", correctOrder: 5, type: "OUTPUT" },
          { blockId: "B06", code: "    total *= i; // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B07", code: "    cin >> total; // DECOY", isDecoy: true, correctOrder: 98, type: "DECOY" },
          { blockId: "B08", code: "// Program End", correctOrder: 6, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B02", token: "MC-CH01-CPP-B02" },
          { qrId: "QR-02", blockId: "B04", token: "MC-CH01-CPP-B04" },
          { qrId: "QR-03", blockId: "B01", token: "MC-CH01-CPP-B01" },
          { qrId: "QR-04", blockId: "B05", token: "MC-CH01-CPP-B05" },
          { qrId: "QR-05", blockId: "B06", token: "MC-CH01-CPP-B06" },
          { qrId: "QR-06", blockId: "B03", token: "MC-CH01-CPP-B03" },
          { qrId: "QR-07", blockId: "B07", token: "MC-CH01-CPP-B07" },
          { qrId: "QR-08", blockId: "B08", token: "MC-CH01-CPP-B08" },
        ]
      },
      c: {
        name: "C (GCC)",
        blocks: [
          { blockId: "B01", code: "#include <stdio.h>", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "int main() {\n    int n, total = 0;", correctOrder: 2, type: "INIT" },
          { blockId: "B03", code: "    scanf(\"%d\", &n);", correctOrder: 3, type: "INPUT" },
          { blockId: "B04", code: "    for (int i = 1; i <= n; i++) {\n        total += i;\n    }", correctOrder: 4, type: "LOOP" },
          { blockId: "B05", code: "    printf(\"%d\\n\", total);\n    return 0;\n}", correctOrder: 5, type: "OUTPUT" },
          { blockId: "B06", code: "    total = total - i; // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B07", code: "    return 1; // DECOY", isDecoy: true, correctOrder: 98, type: "DECOY" },
          { blockId: "B08", code: "/* End of C Logic */", correctOrder: 6, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B01", token: "MC-CH01-C-B01" },
          { qrId: "QR-02", blockId: "B03", token: "MC-CH01-C-B03" },
          { qrId: "QR-03", blockId: "B05", token: "MC-CH01-C-B05" },
          { qrId: "QR-04", blockId: "B02", token: "MC-CH01-C-B02" },
          { qrId: "QR-05", blockId: "B06", token: "MC-CH01-C-B06" },
          { qrId: "QR-06", blockId: "B04", token: "MC-CH01-C-B04" },
          { qrId: "QR-07", blockId: "B07", token: "MC-CH01-C-B07" },
          { qrId: "QR-08", blockId: "B08", token: "MC-CH01-C-B08" },
        ]
      },
      java: {
        name: "Java 11",
        blocks: [
          { blockId: "B01", code: "import java.util.Scanner;", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "public class Main {\n    public static void main(String[] args) {", correctOrder: 2, type: "WRAPPER" },
          { blockId: "B03", code: "        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int total = 0;", correctOrder: 3, type: "INPUT" },
          { blockId: "B04", code: "        for (int i = 1; i <= n; i++) {\n            total += i;\n        }", correctOrder: 4, type: "LOOP" },
          { blockId: "B05", code: "        System.out.println(total);\n    }\n}", correctOrder: 5, type: "OUTPUT" },
          { blockId: "B06", code: "        total = i; // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B07", code: "        sc.close(); throw new RuntimeException(); // DECOY", isDecoy: true, correctOrder: 98, type: "DECOY" },
          { blockId: "B08", code: "        // Java Assembly Target Verified", correctOrder: 6, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B04", token: "MC-CH01-JAVA-B04" },
          { qrId: "QR-02", blockId: "B02", token: "MC-CH01-JAVA-B02" },
          { qrId: "QR-03", blockId: "B01", token: "MC-CH01-JAVA-B01" },
          { qrId: "QR-04", blockId: "B05", token: "MC-CH01-JAVA-B05" },
          { qrId: "QR-05", blockId: "B03", token: "MC-CH01-JAVA-B03" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH01-JAVA-B06" },
          { qrId: "QR-07", blockId: "B07", token: "MC-CH01-JAVA-B07" },
          { qrId: "QR-08", blockId: "B08", token: "MC-CH01-JAVA-B08" },
        ]
      }
    }
  },
  {
    id: "ch-02",
    title: "Challenge 2 – Reverse a String",
    subtitle: "String Inversion Algorithm",
    difficulty: "Easy",
    points: 100,
    category: "Strings & Pointers",
    description: "Read an input word or sequence of characters from standard input and print the exact reversed string.\n\nExample: 'hello' becomes 'olleh'.",
    duration: 1200,
    sampleInput: "hello",
    sampleOutput: "olleh",
    hiddenTests: [
      { id: 1, input: "mindcraft", expectedOutput: "tfardcnim", description: "Platform name reversal" },
      { id: 2, input: "racecar", expectedOutput: "racecar", description: "Palindrome preservation" },
      { id: 3, input: "algorithm", expectedOutput: "mihtirogla", description: "General vocabulary" },
    ],
    languages: {
      python: {
        name: "Python 3",
        blocks: [
          { blockId: "B01", code: "# Read input string\ns = input().strip()", correctOrder: 1, type: "INPUT" },
          { blockId: "B02", code: "# Reverse characters using slicing\nrev = s[::-1]", correctOrder: 2, type: "LOGIC" },
          { blockId: "B03", code: "print(rev)", correctOrder: 3, type: "OUTPUT" },
          { blockId: "B04", code: "s = s.upper()  # DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B05", code: "print(s)  # DECOY", isDecoy: true, correctOrder: 98, type: "DECOY" },
          { blockId: "B06", code: "# Verified String Reversal Pipeline", correctOrder: 4, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B02", token: "MC-CH02-B02-J3K1" },
          { qrId: "QR-02", blockId: "B04", token: "MC-CH02-B04-X8V9" },
          { qrId: "QR-03", blockId: "B01", token: "MC-CH02-B01-T5H2" },
          { qrId: "QR-04", blockId: "B05", token: "MC-CH02-B05-M7Q4" },
          { qrId: "QR-05", blockId: "B03", token: "MC-CH02-B03-R2P6" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH02-B06-N9Z3" },
          { qrId: "QR-07", blockId: "B04", token: "MC-CH02-B04-ALT1" },
          { qrId: "QR-08", blockId: "B05", token: "MC-CH02-B05-ALT2" },
        ]
      },
      cpp: {
        name: "C++ 17",
        blocks: [
          { blockId: "B01", code: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "int main() {\n    string s;\n    if (!(cin >> s)) return 0;", correctOrder: 2, type: "INIT" },
          { blockId: "B03", code: "    reverse(s.begin(), s.end());", correctOrder: 3, type: "LOGIC" },
          { blockId: "B04", code: "    cout << s << endl;\n    return 0;\n}", correctOrder: 4, type: "OUTPUT" },
          { blockId: "B05", code: "    s.clear(); // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B06", code: "// String Reversal End", correctOrder: 5, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B03", token: "MC-CH02-CPP-B03" },
          { qrId: "QR-02", blockId: "B01", token: "MC-CH02-CPP-B01" },
          { qrId: "QR-03", blockId: "B04", token: "MC-CH02-CPP-B04" },
          { qrId: "QR-04", blockId: "B05", token: "MC-CH02-CPP-B05" },
          { qrId: "QR-05", blockId: "B02", token: "MC-CH02-CPP-B02" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH02-CPP-B06" },
          { qrId: "QR-07", blockId: "B05", token: "MC-CH02-CPP-B05B" },
          { qrId: "QR-08", blockId: "B03", token: "MC-CH02-CPP-B03B" },
        ]
      },
      c: {
        name: "C (GCC)",
        blocks: [
          { blockId: "B01", code: "#include <stdio.h>\n#include <string.h>", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "int main() {\n    char s[1000];\n    if (scanf(\"%s\", s) != 1) return 0;", correctOrder: 2, type: "INPUT" },
          { blockId: "B03", code: "    int len = strlen(s);\n    for (int i = 0; i < len / 2; i++) {\n        char tmp = s[i];\n        s[i] = s[len - 1 - i];\n        s[len - 1 - i] = tmp;\n    }", correctOrder: 3, type: "LOGIC" },
          { blockId: "B04", code: "    printf(\"%s\\n\", s);\n    return 0;\n}", correctOrder: 4, type: "OUTPUT" },
          { blockId: "B05", code: "    s[0] = '\\0'; // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B06", code: "/* Reversal Done */", correctOrder: 5, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B02", token: "MC-CH02-C-B02" },
          { qrId: "QR-02", blockId: "B04", token: "MC-CH02-C-B04" },
          { qrId: "QR-03", blockId: "B01", token: "MC-CH02-C-B01" },
          { qrId: "QR-04", blockId: "B03", token: "MC-CH02-C-B03" },
          { qrId: "QR-05", blockId: "B05", token: "MC-CH02-C-B05" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH02-C-B06" },
          { qrId: "QR-07", blockId: "B03", token: "MC-CH02-C-B03B" },
          { qrId: "QR-08", blockId: "B05", token: "MC-CH02-C-B05B" },
        ]
      },
      java: {
        name: "Java 11",
        blocks: [
          { blockId: "B01", code: "import java.util.Scanner;", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "public class Main {\n    public static void main(String[] args) {", correctOrder: 2, type: "WRAPPER" },
          { blockId: "B03", code: "        Scanner sc = new Scanner(System.in);\n        String s = sc.next();", correctOrder: 3, type: "INPUT" },
          { blockId: "B04", code: "        StringBuilder sb = new StringBuilder(s);\n        String rev = sb.reverse().toString();", correctOrder: 4, type: "LOGIC" },
          { blockId: "B05", code: "        System.out.println(rev);\n    }\n}", correctOrder: 5, type: "OUTPUT" },
          { blockId: "B06", code: "        sb.setLength(0); // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B01", token: "MC-CH02-JAVA-B01" },
          { qrId: "QR-02", blockId: "B03", token: "MC-CH02-JAVA-B03" },
          { qrId: "QR-03", blockId: "B05", token: "MC-CH02-JAVA-B05" },
          { qrId: "QR-04", blockId: "B02", token: "MC-CH02-JAVA-B02" },
          { qrId: "QR-05", blockId: "B04", token: "MC-CH02-JAVA-B04" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH02-JAVA-B06" },
          { qrId: "QR-07", blockId: "B03", token: "MC-CH02-JAVA-B03B" },
          { qrId: "QR-08", blockId: "B04", token: "MC-CH02-JAVA-B04B" },
        ]
      }
    }
  },
  {
    id: "ch-03",
    title: "Challenge 3 – Find the Largest Number",
    subtitle: "Array Peak Element Search",
    difficulty: "Hard",
    points: 120,
    category: "Array Traversal",
    description: "Given space-separated integers on standard input, determine and print the maximum (largest) integer in the sequence.",
    duration: 1200,
    sampleInput: "3 8 2 15 6",
    sampleOutput: "15",
    hiddenTests: [
      { id: 1, input: "10 45 2 99 31", expectedOutput: "99", description: "Multi-element sequence" },
      { id: 2, input: "-5 -1 -20 -3", expectedOutput: "-1", description: "Negative integers handling" },
      { id: 3, input: "100 200 50 400 150", expectedOutput: "400", description: "Triple digit values" },
    ],
    languages: {
      python: {
        name: "Python 3",
        blocks: [
          { blockId: "B01", code: "# Parse space-separated integers\nnums = list(map(int, input().split()))", correctOrder: 1, type: "INPUT" },
          { blockId: "B02", code: "# Initialize max with first element\nmax_val = nums[0]", correctOrder: 2, type: "INIT" },
          { blockId: "B03", code: "for x in nums[1:]:", correctOrder: 3, type: "LOOP" },
          { blockId: "B04", code: "    if x > max_val:\n        max_val = x", correctOrder: 4, type: "LOGIC" },
          { blockId: "B05", code: "print(max_val)", correctOrder: 5, type: "OUTPUT" },
          { blockId: "B06", code: "    max_val = 0  # DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B07", code: "    if x < max_val: max_val = x  # DECOY", isDecoy: true, correctOrder: 98, type: "DECOY" },
          { blockId: "B08", code: "# Max Search Sequence Verified", correctOrder: 6, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B04", token: "MC-CH03-B04-W2N8" },
          { qrId: "QR-02", blockId: "B01", token: "MC-CH03-B01-G6M3" },
          { qrId: "QR-03", blockId: "B06", token: "MC-CH03-B06-K4L1" },
          { qrId: "QR-04", blockId: "B02", token: "MC-CH03-B02-C9D5" },
          { qrId: "QR-05", blockId: "B05", token: "MC-CH03-B05-P3S7" },
          { qrId: "QR-06", blockId: "B07", token: "MC-CH03-B07-Y1X6" },
          { qrId: "QR-07", blockId: "B03", token: "MC-CH03-B03-R8Q2" },
          { qrId: "QR-08", blockId: "B08", token: "MC-CH03-B08-V5B4" },
        ]
      },
      cpp: {
        name: "C++ 17",
        blocks: [
          { blockId: "B01", code: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "int main() {\n    int x, max_val;\n    if (!(cin >> max_val)) return 0;", correctOrder: 2, type: "INIT" },
          { blockId: "B03", code: "    while (cin >> x) {\n        if (x > max_val) max_val = x;\n    }", correctOrder: 3, type: "LOOP" },
          { blockId: "B04", code: "    cout << max_val << endl;\n    return 0;\n}", correctOrder: 4, type: "OUTPUT" },
          { blockId: "B05", code: "    max_val = -999999; // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B06", code: "// C++ Array Peak Complete", correctOrder: 5, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B02", token: "MC-CH03-CPP-B02" },
          { qrId: "QR-02", blockId: "B01", token: "MC-CH03-CPP-B01" },
          { qrId: "QR-03", blockId: "B04", token: "MC-CH03-CPP-B04" },
          { qrId: "QR-04", blockId: "B05", token: "MC-CH03-CPP-B05" },
          { qrId: "QR-05", blockId: "B03", token: "MC-CH03-CPP-B03" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH03-CPP-B06" },
          { qrId: "QR-07", blockId: "B03", token: "MC-CH03-CPP-B03B" },
          { qrId: "QR-08", blockId: "B05", token: "MC-CH03-CPP-B05B" },
        ]
      },
      c: {
        name: "C (GCC)",
        blocks: [
          { blockId: "B01", code: "#include <stdio.h>", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "int main() {\n    int x, max_val;\n    if (scanf(\"%d\", &max_val) != 1) return 0;", correctOrder: 2, type: "INIT" },
          { blockId: "B03", code: "    while (scanf(\"%d\", &x) == 1) {\n        if (x > max_val) max_val = x;\n    }", correctOrder: 3, type: "LOOP" },
          { blockId: "B04", code: "    printf(\"%d\\n\", max_val);\n    return 0;\n}", correctOrder: 4, type: "OUTPUT" },
          { blockId: "B05", code: "    max_val = 0; // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" },
          { blockId: "B06", code: "/* C Maximum Complete */", correctOrder: 5, isDecoy: false, type: "COMMENT" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B01", token: "MC-CH03-C-B01" },
          { qrId: "QR-02", blockId: "B03", token: "MC-CH03-C-B03" },
          { qrId: "QR-03", blockId: "B02", token: "MC-CH03-C-B02" },
          { qrId: "QR-04", blockId: "B04", token: "MC-CH03-C-B04" },
          { qrId: "QR-05", blockId: "B05", token: "MC-CH03-C-B05" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH03-C-B06" },
          { qrId: "QR-07", blockId: "B03", token: "MC-CH03-C-B03B" },
          { qrId: "QR-08", blockId: "B04", token: "MC-CH03-C-B04B" },
        ]
      },
      java: {
        name: "Java 11",
        blocks: [
          { blockId: "B01", code: "import java.util.Scanner;", correctOrder: 1, type: "IMPORT" },
          { blockId: "B02", code: "public class Main {\n    public static void main(String[] args) {", correctOrder: 2, type: "WRAPPER" },
          { blockId: "B03", code: "        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int maxVal = sc.nextInt();", correctOrder: 3, type: "INIT" },
          { blockId: "B04", code: "        while (sc.hasNextInt()) {\n            int x = sc.nextInt();\n            if (x > maxVal) maxVal = x;\n        }", correctOrder: 4, type: "LOOP" },
          { blockId: "B05", code: "        System.out.println(maxVal);\n    }\n}", correctOrder: 5, type: "OUTPUT" },
          { blockId: "B06", code: "        maxVal = -1; // DECOY", isDecoy: true, correctOrder: 99, type: "DECOY" }
        ],
        qrTokens: [
          { qrId: "QR-01", blockId: "B04", token: "MC-CH03-JAVA-B04" },
          { qrId: "QR-02", blockId: "B02", token: "MC-CH03-JAVA-B02" },
          { qrId: "QR-03", blockId: "B01", token: "MC-CH03-JAVA-B01" },
          { qrId: "QR-04", blockId: "B03", token: "MC-CH03-JAVA-B03" },
          { qrId: "QR-05", blockId: "B05", token: "MC-CH03-JAVA-B05" },
          { qrId: "QR-06", blockId: "B06", token: "MC-CH03-JAVA-B06" },
          { qrId: "QR-07", blockId: "B04", token: "MC-CH03-JAVA-B04B" },
          { qrId: "QR-08", blockId: "B05", token: "MC-CH03-JAVA-B05B" },
        ]
      }
    }
  }
];
