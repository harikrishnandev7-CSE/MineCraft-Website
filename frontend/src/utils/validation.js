export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateTeamName(name) {
  return typeof name === 'string' && name.trim().length >= 3 && name.trim().length <= 32;
}

export function validateAccessCode(code) {
  return typeof code === 'string' && code.trim().length >= 4;
}
