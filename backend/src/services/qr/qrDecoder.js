exports.decodeQRText = (encodedText) => {
  try {
    return JSON.parse(encodedText);
  } catch {
    return { raw: encodedText };
  }
};
