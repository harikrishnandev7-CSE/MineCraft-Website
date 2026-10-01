const asyncHandler = require('../utils/asyncHandler');
const { getLeaderboardData } = require('../services/leaderboard/leaderboardService');

exports.getLeaderboard = asyncHandler(async (req, res) => {
  const rankings = await getLeaderboardData();
  res.json({ success: true, rankings });
});

exports.getMyRank = asyncHandler(async (req, res) => {
  const rankings = await getLeaderboardData();
  const myRank = rankings.findIndex((r) => r.id.toString() === req.user?._id.toString()) + 1;
  res.json({ success: true, rank: myRank || null });
});
