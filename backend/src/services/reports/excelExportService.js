const XLSX = require('xlsx');
const { getLeaderboardData } = require('../leaderboard/leaderboardService');
const Challenge = require('../../models/Challenge');
const Submission = require('../../models/Submission');

exports.generateExcelReport = async () => {
  const [rankings, challenges, submissions] = await Promise.all([
    getLeaderboardData(),
    Challenge.find().select('title difficulty points category status'),
    Submission.find().populate('userId challengeId').sort({ createdAt: -1 }),
  ]);

  // Sheet 1: Leaderboard & Results
  const leaderboardRows = rankings.map((r) => ({
    Rank: r.rank,
    'Participant Name': r.name,
    'Participant ID': r.participantId,
    Email: r.email,
    'Total Score': r.totalScore,
    'Challenges Attempted': r.challengesAttempted,
    'Challenges Solved': r.challengesSolved,
    'Accepted Submissions': r.acceptedCount,
    'Wrong Submissions': r.wrongCount,
    'Total Submissions': r.totalSubmissions,
    Accuracy: r.accuracy,
    'Reveals Used': r.revealsUsed,
    Penalty: r.penalties,
    'Time Taken': r.timeFormatted,
    'Completion Status': r.status,
  }));

  // Sheet 2: Challenges Overview
  const challengeRows = challenges.map((c) => ({
    Title: c.title,
    Category: c.category,
    Difficulty: c.difficulty,
    Points: c.points,
    Status: c.status,
  }));

  // Sheet 3: Submissions Audit Log
  const submissionRows = submissions.slice(0, 500).map((s) => ({
    'Submission ID': s._id.toString(),
    Participant: s.userId?.name || 'Unknown',
    Email: s.userId?.email || 'N/A',
    Challenge: s.challengeId?.title || 'Unknown',
    Language: (s.language || '').toUpperCase(),
    Status: s.status,
    'Passed Tests': `${s.testCasesPassed}/${s.totalTestCases}`,
    Score: s.score || 0,
    'Execution Time (ms)': s.executionTimeMs || 0,
    'Submitted At': s.createdAt ? new Date(s.createdAt).toISOString() : 'N/A',
  }));

  const wb = XLSX.utils.book_new();

  const wsLeaderboard = XLSX.utils.json_to_sheet(leaderboardRows);
  const wsChallenges = XLSX.utils.json_to_sheet(challengeRows);
  const wsSubmissions = XLSX.utils.json_to_sheet(submissionRows);

  // Set column widths
  wsLeaderboard['!cols'] = [
    { wch: 8 },  // Rank
    { wch: 22 }, // Name
    { wch: 16 }, // ID
    { wch: 26 }, // Email
    { wch: 12 }, // Score
    { wch: 20 }, // Attempted
    { wch: 18 }, // Solved
    { wch: 18 }, // Accepted
    { wch: 18 }, // Wrong
    { wch: 18 }, // Total Submissions
    { wch: 12 }, // Accuracy
    { wch: 14 }, // Reveals Used
    { wch: 10 }, // Penalty
    { wch: 14 }, // Time
    { wch: 18 }, // Status
  ];

  XLSX.utils.book_append_sheet(wb, wsLeaderboard, 'Leaderboard');
  XLSX.utils.book_append_sheet(wb, wsChallenges, 'Challenges');
  XLSX.utils.book_append_sheet(wb, wsSubmissions, 'Submissions');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};
