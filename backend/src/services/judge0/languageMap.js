const languageMap = {
  python: 71, // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  cpp: 54, // C++ (GCC 9.2.0)
  java: 62, // Java (OpenJDK 13.0.1)
  c: 50, // C (GCC 9.2.0)
};

module.exports = {
  getLanguageId: (lang) => languageMap[lang?.toLowerCase()] || 71,
  languageMap,
};
