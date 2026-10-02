const mongoose = require('mongoose');
const User = require('../models/User');
const env = require('../config/env');

const seedAdmin = async () => {
  try {
    const mongoUri = env.MONGO_URI || env.MONGODB_URI;
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });

    const adminEmail = (env.ADMIN_EMAIL || 'admin@mindcraft.io').trim().toLowerCase();
    const adminPassword = env.ADMIN_PASSWORD || 'AdminSecurePassword2026!';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.name = 'Mind Craft Administrator';
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.isActive = true;
      await admin.save();
      console.log(`[Seed] Existing admin user updated: ${adminEmail}`);
    } else {
      admin = await User.create({
        name: 'Mind Craft Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`[Seed] New admin user created: ${adminEmail}`);
    }

    console.log('\n===========================================');
    console.log('ADMIN CREDENTIALS SEEDED:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     admin`);
    console.log('===========================================\n');

    await mongoose.disconnect();
    return true;
  } catch (err) {
    console.error('[Seed] Error seeding admin:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    throw err;
  }
};

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedAdmin;
