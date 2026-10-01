import { SUPPORTED_LANGUAGES } from './constants';

export function getLanguageById(id) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.id === id) || SUPPORTED_LANGUAGES[0];
}

export function getJudge0LanguageId(language) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.id === language);
  return lang ? lang.judge0Id : 71; // Default to Python
}
