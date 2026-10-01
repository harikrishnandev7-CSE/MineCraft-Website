export function combineBlocks(blocks = []) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks
    .filter((b) => b && typeof b.code === 'string')
    .map((b) => b.code)
    .join('\n');
}

export function checkAssemblyAccuracy(placedBlocks = [], targetBlocks = []) {
  // Filter out decoys from expected count
  const essentialTargetBlocks = targetBlocks.filter((b) => !b.isDecoy);
  
  if (placedBlocks.length !== essentialTargetBlocks.length) {
    return {
      isCorrect: false,
      reason: `Block count mismatch. Placed ${placedBlocks.length} of ${essentialTargetBlocks.length} required blocks.`,
      placedCount: placedBlocks.length,
      requiredCount: essentialTargetBlocks.length,
    };
  }

  // Check if any decoy was accidentally placed
  const hasDecoy = placedBlocks.some((b) => b.isDecoy);
  if (hasDecoy) {
    return {
      isCorrect: false,
      reason: 'Syntax error: An invalid decoy block was included in the assembly.',
      hasDecoy: true,
    };
  }

  // Check sequential correctOrder
  for (let i = 0; i < placedBlocks.length; i++) {
    if (placedBlocks[i].correctOrder !== i + 1) {
      return {
        isCorrect: false,
        reason: `Logic error at block position #${i + 1}. Block '${placedBlocks[i].blockId}' is placed out of order.`,
        failedIndex: i,
      };
    }
  }

  return { isCorrect: true, reason: 'Assembly verified: Block structure is mathematically correct.' };
}
