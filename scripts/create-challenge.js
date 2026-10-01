/**
 * CLI utility to author and seed a challenge interactively or via JSON payload.
 * Usage: node scripts/create-challenge.js path/to/challenge.json
 */
const fs = require('fs');

function loadChallengeConfig(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    console.log('No file specified. Using default template challenge.');
    return {
      title: 'Example Challenge',
      difficulty: 'Easy',
      points: 100,
    };
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const config = loadChallengeConfig(process.argv[2]);
console.log('Creating Challenge:', config.title);
