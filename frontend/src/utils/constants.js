export const APP_NAME = "MIND CRAFT";
export const APP_SUBTITLE = "Blind Coding & Code Assembly Platform";

export const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5055/api';

export const DEFAULT_DURATION_SECONDS = 20 * 60; // 20 minutes

export const STORAGE_KEYS = {
  PARTICIPANT: 'mc_participant',
  CHALLENGE_SESSION: 'mc_challenge_session',
  START_TIME: 'mc_start_time',
  QR_PROGRESS: 'mc_qr_progress',
  UNLOCKED_BLOCKS: 'mc_unlocked_blocks',
  ASSEMBLY_ORDER: 'mc_assembly_order',
  SUBMISSION_ATTEMPTS: 'mc_submission_attempts',
  FINAL_RESULT: 'mc_final_result',
  LEADERBOARD: 'mc_leaderboard',
  ADMIN_CHALLENGES: 'mc_admin_challenges',
};

export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', extension: '.py', monacoLang: 'python' },
  { id: 'c', name: 'C', extension: '.c', monacoLang: 'c' },
  { id: 'cpp', name: 'C++', extension: '.cpp', monacoLang: 'cpp' },
  { id: 'java', name: 'Java', extension: '.java', monacoLang: 'java' },
];

export const STATUS_TYPES = {
  IDLE: 'IDLE',
  COMPILING: 'COMPILING',
  RUNNING: 'RUNNING',
  VALIDATING: 'VALIDATING',
  ACCEPTED: 'ACCEPTED',
  WRONG_ANSWER: 'WRONG_ANSWER',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIME_EXPIRED: 'TIME_EXPIRED',
};
