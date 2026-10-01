/**
 * Merges blocks into a single executable code string based on assembly order.
 */
export function combineBlocks(blocks = []) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks
    .filter((b) => b && b.code)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((b) => b.code)
    .join('\n');
}

/**
 * Validates if all required blocks have been collected.
 */
export function checkBlockCompleteness(collected = [], required = []) {
  const collectedIds = new Set(collected.map((b) => b.id || b._id));
  const missing = required.filter((reqId) => !collectedIds.has(reqId));
  return {
    isComplete: missing.length === 0,
    missingCount: missing.length,
    missingIds: missing,
  };
}
