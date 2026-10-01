const { logger } = require('../utils/logger');

exports.cleanupExpiredSessions = async () => {
  logger.info('Running session cleanup job...');
  // Logic to auto-close sessions past event endTime
};
