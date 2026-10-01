const { normalizeOutput } = require('../../utils/outputNormalizer');

exports.compareOutputs = (actual, expected) => {
  return normalizeOutput(actual) === normalizeOutput(expected);
};
