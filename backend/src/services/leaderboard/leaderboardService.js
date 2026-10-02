const Submission = require('../../models/Submission');
const User = require('../../models/User');
const ParticipantSession = require('../../models/ParticipantSession');

exports.getLeaderboardData = async () => {
  const users = await User.find({ role: 'participant' }).select('name email teamName college');
  const [submissions, sessions] = await Promise.all([
    Submission.find().populate('challengeId', 'title points'),
    ParticipantSession.find(),
  ]);

  const leaderboard = users.map((u) => {
    const userSubs = submissions.filter((s) => s.userId?.toString() === u._id?.toString());
    const userSessions = sessions.filter((s) => s.userId?.toString() === u._id?.toString());

    const acceptedSubs = userSubs.filter((s) => s.status === 'ACCEPTED');
    const wrongSubs = userSubs.filter((s) => s.status === 'WRONG_ANSWER');
    const totalSubmissions = userSubs.length;

    // Distinct challenges solved
    const solvedChallengeIds = new Set(acceptedSubs.map((s) => s.challengeId?._id?.toString() || s.challengeId?.toString()));
    const challengesSolved = solvedChallengeIds.size;

    // Sum scores from distinct highest scoring attempts per challenge
    const challengeMaxScoreMap = {};
    userSubs.forEach((sub) => {
      const cId = sub.challengeId?._id?.toString() || sub.challengeId?.toString();
      const currentScore = sub.score || (sub.status === 'ACCEPTED' ? (sub.challengeId?.points || 100) : 0);
      if (!challengeMaxScoreMap[cId] || currentScore > challengeMaxScoreMap[cId]) {
        challengeMaxScoreMap[cId] = currentScore;
      }
    });

    const totalScore = Object.values(challengeMaxScoreMap).reduce((a, b) => a + b, 0);

    // Sum penalties and reveals from sessions
    const totalPenalties = userSessions.reduce((acc, s) => acc + (s.penaltyCount || 0) + (s.revealsCount || 0) * 5, 0);
    const revealsUsed = userSessions.reduce((acc, s) => acc + (s.revealsCount || 0), 0);

    // Total duration spent across sessions
    const totalSecondsSpent = userSessions.reduce((acc, s) => {
      if (s.startTime && s.endTime) {
        return acc + Math.round((new Date(s.endTime) - new Date(s.startTime)) / 1000);
      }
      return acc + 600;
    }, 0);

    const minutes = Math.floor(totalSecondsSpent / 60);
    const seconds = totalSecondsSpent % 60;
    const timeFormatted = `${minutes}m ${String(seconds).padStart(2, '0')}s`;

    // Accuracy calculation
    const accuracy = totalSubmissions > 0 ? Math.round((acceptedSubs.length / totalSubmissions) * 100) : 0;

    // Status
    let status = 'Idle';
    const hasActiveSession = userSessions.some((s) => !s.isCompleted && s.status === 'ACTIVE');
    const hasCompleted = userSessions.some((s) => s.isCompleted);
    if (hasActiveSession) status = 'Active';
    else if (hasCompleted || challengesSolved > 0) status = 'Completed';

    return {
      id: u._id,
      participantId: `MC-${u._id.toString().slice(-4).toUpperCase()}`,
      name: u.name,
      email: u.email,
      teamName: u.teamName || u.name,
      college: u.college || 'Engineering Institute',
      totalScore,
      challengesSolved,
      challengesAttempted: userSessions.length || (totalSubmissions > 0 ? 1 : 0),
      totalSubmissions,
      acceptedCount: acceptedSubs.length,
      wrongCount: wrongSubs.length,
      accuracy: `${accuracy}%`,
      penalties: totalPenalties,
      revealsUsed,
      timeFormatted,
      totalSecondsSpent,
      status,
    };
  });

  // Sort by score desc, solved desc, totalSecondsSpent asc, penalties asc
  leaderboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.challengesSolved !== a.challengesSolved) return b.challengesSolved - a.challengesSolved;
    if (a.totalSecondsSpent !== b.totalSecondsSpent) return a.totalSecondsSpent - b.totalSecondsSpent;
    return a.penalties - b.penalties;
  });

  // Assign ranks
  return leaderboard.map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));
};
