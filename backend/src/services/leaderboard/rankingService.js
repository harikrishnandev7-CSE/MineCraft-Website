exports.calculateRankings = (scores = []) => {
  return scores.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.totalTimeSeconds - b.totalTimeSeconds;
  });
};
