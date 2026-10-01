const Submission = require('../../models/Submission');
const User = require('../../models/User');

exports.getLeaderboardData = async () => {
  const users = await User.find({ role: 'participant' }).select('name teamName');
  const subs = await Submission.find({ status: 'ACCEPTED' });

  const board = users.map((u) => {
    const userSubs = subs.filter((s) => s.userId.toString() === u._id.toString());
    return {
      id: u._id,
      name: u.name,
      teamName: u.teamName || u.name,
      challengesSolved: userSubs.length,
      totalScore: userSubs.length * 100,
      timeFormatted: '12m 30s',
    };
  });

  return board.sort((a, b) => b.totalScore - a.totalScore);
};
