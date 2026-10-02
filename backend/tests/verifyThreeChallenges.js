const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function verifyThreeChallenges() {
  console.log('--- VERIFYING 3 DEFAULT CHALLENGES IN MONGODB ATLAS ---');

  // 1. Get all public challenges
  const res = await axios.get(`${BASE_URL}/challenges`);
  const challenges = res.data.challenges;
  console.log(`Retrieved ${challenges.length} challenges from MongoDB Atlas.`);

  const titles = [
    'Smart Expense Analyzer',
    'Movie Recommendation Engine',
    'Campus Event Seat Manager',
  ];

  for (const title of titles) {
    const ch = challenges.find((c) => c.title === title);
    if (!ch) {
      throw new Error(`Missing expected challenge: "${title}" in MongoDB Atlas!`);
    }

    console.log(`\n======================================================`);
    console.log(`CHALLENGE: "${ch.title}" (ID: ${ch._id})`);
    console.log(`  - Difficulty: ${ch.difficulty}`);
    console.log(`  - Language: ${ch.sourceLanguage}`);
    console.log(`  - Points: ${ch.points}`);
    console.log(`  - Status: ${ch.status}`);
    console.log(`  - Tasks Count: ${ch.tasks?.length || 0}`);
    console.log(`  - Test Cases Count: ${ch.testCases?.length || 0}`);

    // Verify tasks details
    if (!ch.tasks || ch.tasks.length === 0) {
      throw new Error(`Challenge "${title}" has no reveal tasks!`);
    }

    ch.tasks.forEach((t) => {
      console.log(`    * Task ${t.taskId}: "${t.title}" (Blocks: ${t.requiredBlockIds.join(', ')}, Penalty: -${t.penalty} pts)`);
    });

    // Check participant view of blocks
    const blocksRes = await axios.get(`${BASE_URL}/challenges/${ch._id}/blocks`);
    console.log(`  - Participant Visible Blocks: ${blocksRes.data.blocks.length} (Unlocked count: ${blocksRes.data.unlockedCount} / ${blocksRes.data.totalBlocks})`);
    
    // Check that source code is NOT leaked
    const detailRes = await axios.get(`${BASE_URL}/challenges/${ch._id}`);
    if (detailRes.data.challenge.sourceCode) {
      throw new Error(`SECURITY VIOLATION: Source code leaked for ${title}!`);
    }
  }

  // 2. Test Task-Based Reveal
  console.log(`\n--- TESTING TASK-BASED REVEAL FLOW ---`);
  // Register or login a test contestant
  const participantEmail = `task_reveal_test_${Date.now()}@college.edu`;
  await axios.post(`${BASE_URL}/participants/register`, {
    name: 'Task Tester',
    email: participantEmail,
    password: 'Password123!',
    teamName: 'RevealTeam',
    college: 'MIT',
  });
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: participantEmail,
    password: 'Password123!',
  });
  const token = loginRes.data.token;

  const expenseChal = challenges.find((c) => c.title === 'Smart Expense Analyzer');
  console.log(`Testing task reveal for "${expenseChal.title}" Task 2...`);

  const revealRes = await axios.post(
    `${BASE_URL}/challenges/${expenseChal._id}/reveal`,
    { taskId: 2 },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  console.log(`✓ Task 2 Reveal successful:`);
  console.log(`  - Revealed Block ID: ${revealRes.data.revealedBlock.blockId}`);
  console.log(`  - Code: ${revealRes.data.revealedBlock.code.split('\n')[0]}...`);
  console.log(`  - Total Reveals: ${revealRes.data.revealsCount}`);
  console.log(`  - Current Penalty: -${revealRes.data.penalty} pts`);

  console.log('\n--- ALL 3 DEFAULT CHALLENGES & TASK REVEAL VERIFIED SUCCESSFULLY! ---');
}

verifyThreeChallenges().catch((err) => {
  console.error('❌ Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
