exports.validateChallengeCreate = (body) => {
  const errors = [];
  if (!body.title) errors.push('Title is required');
  if (!body.description) errors.push('Description is required');
  return errors;
};
