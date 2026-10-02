const LANGUAGE_IDS = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
};

const getLanguageId = (lang) => {
  if (!lang || typeof lang !== 'string') return null;
  const normalized = lang.trim().toLowerCase();
  return LANGUAGE_IDS[normalized] || null;
};

const isSupportedLanguage = (lang) => {
  return getLanguageId(lang) !== null;
};

module.exports = {
  LANGUAGE_IDS,
  getLanguageId,
  isSupportedLanguage,
};
