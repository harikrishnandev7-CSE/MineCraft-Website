const PDFDocument = require('pdfkit');
const { getLeaderboardData } = require('../leaderboard/leaderboardService');
const Challenge = require('../../models/Challenge');

exports.generatePdfReport = async () => {
  const [rankings, totalChallenges] = await Promise.all([
    getLeaderboardData(),
    Challenge.countDocuments(),
  ]);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#0f172a');
      doc.fillColor('#38bdf8').fontSize(18).font('Helvetica-Bold').text('MINDCRAFT BLIND CODING ARENA', 55, 52);
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Official Competition Results & Performance Report', 55, 75);
      doc.fillColor('#38bdf8').fontSize(8).text(`Generated: ${new Date().toUTCString()}`, 380, 75);

      doc.moveDown(3);

      // Summary statistics cards
      const topScore = rankings.length > 0 ? rankings[0].totalScore : 0;
      const totalParticipants = rankings.length;

      doc.fillColor('#1e293b').rect(40, 115, 120, 45).fill();
      doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text('TOTAL CONTESTANTS', 50, 123);
      doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text(String(totalParticipants), 50, 137);

      doc.fillColor('#1e293b').rect(170, 115, 120, 45).fill();
      doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text('TOTAL CHALLENGES', 180, 123);
      doc.fillColor('#38bdf8').fontSize(14).font('Helvetica-Bold').text(String(totalChallenges), 180, 137);

      doc.fillColor('#1e293b').rect(300, 115, 120, 45).fill();
      doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text('CHAMPION SCORE', 310, 123);
      doc.fillColor('#34d399').fontSize(14).font('Helvetica-Bold').text(`${topScore} PTS`, 310, 137);

      doc.fillColor('#1e293b').rect(430, 115, 125, 45).fill();
      doc.fillColor('#94a3b8').fontSize(7).font('Helvetica').text('TOP PARTICIPANT', 440, 123);
      doc.fillColor('#f59e0b').fontSize(11).font('Helvetica-Bold').text(rankings[0]?.name || 'N/A', 440, 138, { width: 110, ellipsis: true });

      // Table Header
      let y = 175;
      doc.fillColor('#0284c7').rect(40, y, 515, 20).fill();
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('RANK', 45, y + 6);
      doc.text('PARTICIPANT', 80, y + 6);
      doc.text('SCORE', 215, y + 6);
      doc.text('SOLVED', 270, y + 6);
      doc.text('ACCURACY', 325, y + 6);
      doc.text('PENALTIES', 390, y + 6);
      doc.text('TIME', 450, y + 6);
      doc.text('STATUS', 505, y + 6);

      y += 20;

      // Table Rows
      rankings.slice(0, 30).forEach((r, idx) => {
        const isEven = idx % 2 === 0;
        doc.fillColor(isEven ? '#0f172a' : '#1e293b').rect(40, y, 515, 18).fill();

        doc.fillColor('#38bdf8').fontSize(8).font('Helvetica-Bold').text(`#${r.rank}`, 45, y + 5);
        doc.fillColor('#f8fafc').font('Helvetica').text(r.name, 80, y + 5, { width: 130, ellipsis: true });
        doc.fillColor('#34d399').font('Helvetica-Bold').text(String(r.totalScore), 215, y + 5);
        doc.fillColor('#e2e8f0').font('Helvetica').text(String(r.challengesSolved), 270, y + 5);
        doc.fillColor('#cbd5e1').text(r.accuracy, 325, y + 5);
        doc.fillColor('#f87171').text(String(r.penalties), 390, y + 5);
        doc.fillColor('#e2e8f0').text(r.timeFormatted, 450, y + 5);
        doc.fillColor(r.status === 'Completed' ? '#34d399' : '#38bdf8').font('Helvetica-Bold').text(r.status, 505, y + 5);

        y += 18;

        // Page break handling
        if (y > 750 && idx < rankings.length - 1) {
          doc.addPage();
          y = 50;
        }
      });

      // Footer
      doc.fontSize(8).fillColor('#64748b').text('MindCraft Blind Coding Platform — Confidential Evaluation Report', 40, 780, {
        align: 'center',
        width: 515,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
