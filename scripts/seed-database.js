/**
 * Master database initialization and seeding script.
 * Usage: node scripts/seed-database.js
 */
const seedAdmin = require('../backend/src/seeds/seedAdmin');
const seedChallenges = require('../backend/src/seeds/seedChallenges');
const seedTestUsers = require('../backend/src/seeds/seedTestUsers');

async function seedAll() {
  console.log('[Seed] Initializing complete database seeding...');
  try {
    await seedAdmin();
    await seedChallenges();
    await seedTestUsers();
    console.log('[Seed] Database initialization complete!');
  } catch (err) {
    console.error('[Seed Error]', err);
  }
}

if (require.main === module) {
  seedAll();
}

module.exports = seedAll;
