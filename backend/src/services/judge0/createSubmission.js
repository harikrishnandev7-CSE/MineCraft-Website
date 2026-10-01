const judge0Client = require('./judge0Client');
const { getLanguageId } = require('./languageMap');

exports.createSubmission = async ({ sourceCode, language, stdin = '', expectedOutput = '' }) => {
  const payload = {
    source_code: Buffer.from(sourceCode).toString('base64'),
    language_id: getLanguageId(language),
    stdin: Buffer.from(stdin).toString('base64'),
    expected_output: expectedOutput ? Buffer.from(expectedOutput).toString('base64') : null,
  };

  const response = await judge0Client.post('/submissions?base64_encoded=true&wait=true', payload);
  return response.data;
};
