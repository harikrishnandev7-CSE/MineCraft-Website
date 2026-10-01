const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('../config/env');

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    const existing = await User.findOne({ email: env.ADMIN_EMAIL });
    if (!existing) {
      await User.create({
        name: 'Mind Craft Administrator',
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('Admin user seeded successfully');
    } else {
      console.log('Admin user already exists');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seed Admin Error:', err);
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
