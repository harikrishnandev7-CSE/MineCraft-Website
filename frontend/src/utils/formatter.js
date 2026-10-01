export function formatMemory(bytes = 14200000) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatExecutionTime(seconds = 0.04) {
  return `${seconds.toFixed(2)}s`;
}

export function sanitizeCode(code = '') {
  return code.trim();
}
