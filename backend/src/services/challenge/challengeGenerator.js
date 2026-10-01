exports.sliceCodeIntoBlocks = (fullCode, delimiters = ['# BLOCK']) => {
  const lines = fullCode.split('\n');
  const blocks = [];
  let current = [];

  lines.forEach((line) => {
    if (delimiters.some((d) => line.includes(d))) {
      if (current.length > 0) blocks.push(current.join('\n'));
      current = [];
    } else {
      current.push(line);
    }
  });

  if (current.length > 0) blocks.push(current.join('\n'));
  return blocks;
};
