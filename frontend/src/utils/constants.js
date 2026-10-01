export const APP_NAME = 'Mind Craft';
export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python 3', judge0Id: 71, extension: 'py', template: '# Write your solution here\n' },
  { id: 'javascript', name: 'JavaScript (Node.js)', judge0Id: 63, extension: 'js', template: '// Write your solution here\n' },
  { id: 'cpp', name: 'C++ 17', judge0Id: 54, extension: 'cpp', template: '#include <iostream>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n' },
  { id: 'java', name: 'Java 11', judge0Id: 62, extension: 'java', template: 'public class Main {\n  public static void main(String[] args) {\n  }\n}\n' },
];

export const SUBMISSION_STATUS = {
  PENDING: 'PENDING',
  COMPILING: 'COMPILING',
  RUNNING: 'RUNNING',
  ACCEPTED: 'ACCEPTED',
  WRONG_ANSWER: 'WRONG_ANSWER',
  TIME_LIMIT_EXCEEDED: 'TIME_LIMIT_EXCEEDED',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
};

export const QR_BLOCK_TYPES = {
  IMPORT: 'IMPORT',
  LOGIC: 'LOGIC',
  FUNCTION: 'FUNCTION',
  WRAPPER: 'WRAPPER',
  OUTPUT: 'OUTPUT',
};
