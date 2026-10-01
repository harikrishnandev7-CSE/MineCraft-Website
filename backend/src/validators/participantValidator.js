exports.validateParticipantRegister = (body) => {
  const errors = [];
  if (!body.teamName) errors.push('Team name is required');
  if (!body.sessionCode) errors.push('Session code is required');
  return errors;
};
