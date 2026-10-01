exports.checkIfSessionExpired = (startTime, durationLimitSeconds) => {
  const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000;
  return elapsed > durationLimitSeconds;
};
