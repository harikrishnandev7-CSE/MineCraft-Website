const judge0Client = require('./judge0Client');

exports.getSubmission = async (token) => {
  const response = await judge0Client.get(`/submissions/${token}?base64_encoded=true`);
  return response.data;
};
