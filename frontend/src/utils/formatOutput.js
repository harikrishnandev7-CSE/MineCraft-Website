/**
 * Normalizes stdout/stderr strings by removing ANSI codes and trailing carriage returns.
 */
export function formatOutput(output = '') {
  if (typeof output !== 'string') return '';
  return output
    .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '') // strip ansi escape codes
    .replace(/\r\n/g, '\n')
    .trim();
}

/**
 * Truncates output preview if too long.
 */
export function truncateOutput(output = '', maxLength = 2000) {
  if (output.length <= maxLength) return output;
  return output.slice(0, maxLength) + '\n...[Output truncated]';
}
