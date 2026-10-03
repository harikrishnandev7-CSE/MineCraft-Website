const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    if (!env.MONGO_URI) {
      console.log('[Database] No MONGO_URI provided, skipping MongoDB connection.');
      return;
    }
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB connection warning (${error.message}). Retrying in background...`);
    // Attempt background reconnection
    setTimeout(() => {
      mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      }).then(c => {
        console.log(`[Database] MongoDB Connected in background: ${c.connection.host}`);
      }).catch(e => {
        console.warn(`[Database] Background MongoDB connection retry failed: ${e.message}`);
      });
    }, 2000);
  }
};

module.exports = connectDB;
