const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('../config/env');

const seedTestUsers = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    const testUsers = [
      { name: 'Alice Walker', email: 'alice@mindcraft.io', password: 'Password123!', teamName: 'NullPointers' },
      { name: 'Bob Stone', email: 'bob@mindcraft.io', password: 'Password123!', teamName: 'ByteBusters' },
    ];
    for (const u of testUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
      }
    }
    console.log('Test users seeded successfully');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed Test Users Error:', err);
  }
};

if (require.main === module) {
  seedTestUsers();
}

module.exports = seedTestUsers;
