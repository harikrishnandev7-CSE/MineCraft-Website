/**
 * Export results of an event session to CSV format.
 * Usage: node scripts/export-results.js <sessionCode>
 */
const fs = require('fs');
const path = require('path');

function exportToCSV(sessionCode = 'ALL', results = []) {
  const dummyResults = [
    { rank: 1, team: 'NullPointers', score: 450, solved: 3, time: '28m 10s' },
    { rank: 2, team: 'ByteBusters', score: 350, solved: 2, time: '31m 45s' },
  ];

  const rows = ['Rank,Team Name,Score,Challenges Solved,Time'];
  dummyResults.forEach((r) => {
    rows.push(`${r.rank},${r.team},${r.score},${r.solved},${r.time}`);
  });

  const outPath = path.join(__dirname, `results_${sessionCode}.csv`);
  fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
  console.log(`Exported results to ${outPath}`);
}

if (require.main === module) {
  exportToCSV(process.argv[2] || 'MINDCRAFT-2026');
}

module.exports = exportToCSV;
