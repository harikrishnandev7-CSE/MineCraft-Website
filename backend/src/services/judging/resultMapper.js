exports.mapJudge0Status = (statusId) => {
  switch (statusId) {
    case 3:
      return 'ACCEPTED';
    case 4:
      return 'WRONG_ANSWER';
    case 5:
      return 'TIME_LIMIT_EXCEEDED';
    case 6:
      return 'COMPILATION_ERROR';
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
      return 'RUNTIME_ERROR';
    default:
      return 'PENDING';
  }
};
