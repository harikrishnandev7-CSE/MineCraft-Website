/**
 * assembly.js
 *
 * Utility helpers for fragment combining and mock-judge ordering checks.
 * Real judging relies on Judge0 execution output, not this module.
 * This module is used ONLY by the mock adapter.
 */

/** Join fragments in current board order into a single source string */
export function combineFragments(fragments = []) {
  if (!Array.isArray(fragments) || fragments.length === 0) return '';
  return fragments
    .filter((f) => f && typeof f.code === 'string')
    .map((f) => f.code)
    .join('\n');
}

/** @deprecated kept for legacy callers; delegates to combineFragments */
export function combineBlocks(blocks = []) {
  return combineFragments(blocks);
}

/**
 * Check if the placed fragment order matches any accepted ordering.
 * Used ONLY by the mock adapter – production uses execution output.
 *
 * @param {string[]} placedIds   – fragment ids in the participant's current order
 * @param {string[]} canonicalIds – fragment ids in the correct order (fragments[].id)
 * @param {string[][]} acceptedOrders – optional extra valid orderings
 * @returns {{ isCorrect: boolean, reason: string }}
 */
export function checkFragmentOrder(placedIds = [], canonicalIds = [], acceptedOrders = []) {
  if (placedIds.length !== canonicalIds.length) {
    return {
      isCorrect: false,
      reason: `Fragment count mismatch. Placed ${placedIds.length} of ${canonicalIds.length} required.`,
    };
  }

  const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  if (arraysEqual(placedIds, canonicalIds)) {
    return { isCorrect: true, reason: 'Canonical order matched.' };
  }

  for (const alt of acceptedOrders) {
    if (arraysEqual(placedIds, alt)) {
      return { isCorrect: true, reason: 'Alternate accepted order matched.' };
    }
  }

  return {
    isCorrect: false,
    reason: 'Fragment arrangement does not match any accepted order. Try reordering.',
  };
}

/**
 * Seeded shuffle (Fisher-Yates with a simple numeric seed).
 * Produces a deterministic permutation so refreshes produce the same vault order.
 *
 * @param {any[]} arr
 * @param {number} seed
 * @returns {any[]} new shuffled array
 */
export function seededShuffle(arr, seed) {
  const result = [...arr];
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Normalise a program output string for comparison: trim + CRLF→LF */
export function normalizeOutput(str = '') {
  return str.replace(/\r\n/g, '\n').trim();
}
