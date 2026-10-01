exports.normalizeOutput = (text = '') => {
  if (typeof text !== 'string') return '';
  return text.replace(/\r\n/g, '\n').trim();
};
