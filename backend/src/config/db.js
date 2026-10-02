const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    if (!env.MONGO_URI) {
      console.log('[Database] No MONGO_URI provided, skipping MongoDB connection.');
      return;
    }
    const conn = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[Database] MongoDB not available (${error.message}). Running in standalone execution mode.`);
  }
};

module.exports = connectDB;
