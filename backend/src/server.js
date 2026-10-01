const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`[Mind Craft Server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();
