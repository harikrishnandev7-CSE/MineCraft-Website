/**
 * Formats seconds into HH:MM:SS format.
 */
export function formatTime(seconds = 0) {
  const safeSec = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSec / 3600);
  const mins = Math.floor((safeSec % 3600) / 60);
  const secs = safeSec % 60;

  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Calculates remaining seconds given target end timestamp.
 */
export function getRemainingSeconds(targetTime) {
  const diff = new Date(targetTime).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}
