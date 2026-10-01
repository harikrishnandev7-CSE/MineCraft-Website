exports.validateSubmission = (body) => {
  const errors = [];
  if (!body.code) errors.push('Code payload is required');
  if (!body.language) errors.push('Language is required');
  if (!body.challengeId) errors.push('Challenge ID is required');
  return errors;
};
