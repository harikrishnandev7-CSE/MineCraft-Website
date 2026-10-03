const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Challenge = require('../src/models/Challenge');
const Settings = require('../src/models/Settings');
const Submission = require('../src/models/Submission');
const ParticipantSession = require('../src/models/ParticipantSession');

let mongoServer;
let adminToken = '';
let easyChallenge = null;
let mediumChallenge = null;
let hardChallenge = null;

jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.disconnect();
  await mongoose.connect(uri);

  // 1. Create admin user & get token
  await User.create({
    name: 'Admin User',
    email: 'admin@mindcraft.test',
    password: 'AdminPassword123!',
    role: 'admin',
  });

  const adminLogin = await request(app).post('/api/auth/admin/login').send({
    email: 'admin@mindcraft.test',
    password: 'AdminPassword123!',
  });
  adminToken = adminLogin.body.token;

  // 2. Create Settings with progression enforced
  await Settings.create({
    competitionName: 'Progression Test Arena',
    enforceProgression: true,
  });

  // 3. Create published Easy, Medium, Hard challenges
  easyChallenge = await Challenge.create({
    slug: 'ch-easy-test',
    title: 'Easy Challenge Title',
    description: 'Solve the easy challenge',
    difficulty: 'Easy',
    points: 100,
    status: 'Published',
    isActive: true,
    tasks: [
      {
        taskId: 't-easy-1',
        title: 'Task 1',
        order: 1,
        quizPool: [
          {
            quizId: 'q-easy-1',
            type: 'MCQ',
            prompt: 'What is 1 + 1?',
            options: ['1', '2', '3'],
            answer: '2',
            explain: '1 + 1 = 2',
          },
        ],
      },
    ],
  });

  mediumChallenge = await Challenge.create({
    slug: 'ch-medium-test',
    title: 'Medium Challenge Title',
    description: 'Solve the medium challenge',
    difficulty: 'Medium',
    points: 200,
    status: 'Published',
    isActive: true,
    tasks: [
      {
        taskId: 't-med-1',
        title: 'Task 1',
        order: 1,
        quizPool: [
          {
            quizId: 'q-med-1',
            type: 'MCQ',
            prompt: 'What is 2 * 2?',
            options: ['2', '4', '6'],
            answer: '4',
            explain: '2 * 2 = 4',
          },
        ],
      },
    ],
  });

  hardChallenge = await Challenge.create({
    slug: 'ch-hard-test',
    title: 'Hard Challenge Title',
    description: 'Solve the hard challenge',
    difficulty: 'Hard',
    points: 300,
    status: 'Published',
    isActive: true,
    tasks: [
      {
        taskId: 't-hard-1',
        title: 'Task 1',
        order: 1,
        quizPool: [
          {
            quizId: 'q-hard-1',
            type: 'MCQ',
            prompt: 'What is 2 ^ 3?',
            options: ['6', '8', '9'],
            answer: '8',
            explain: '2 ^ 3 = 8',
          },
        ],
      },
    ],
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Sequential Challenge Progression Verification', () => {
  let participant1 = null;
  let token1 = '';

  beforeAll(async () => {
    // Register participant 1
    const res = await request(app).post('/api/participants/register').send({
      name: 'Bob Contestant',
      participantId: 'MC-BOB-01',
      email: 'bob@example.com',
      college: 'Engineering College',
      department: 'CSE',
    });
    participant1 = res.body.user;
    token1 = res.body.token;
  });

  test('1. New participant: progress shows Easy UNLOCKED, Medium LOCKED, Hard LOCKED', async () => {
    const res = await request(app)
      .get('/api/challenges/progress')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.enforceProgression).toBe(true);

    const easy = res.body.progress.find((p) => p.slug === 'ch-easy-test');
    const med = res.body.progress.find((p) => p.slug === 'ch-medium-test');
    const hard = res.body.progress.find((p) => p.slug === 'ch-hard-test');

    expect(easy.status).toBe('UNLOCKED');
    expect(med.status).toBe('LOCKED');
    expect(med.requiredChallengeTitles).toContain('Easy Challenge Title');
    expect(hard.status).toBe('LOCKED');
  });

  test('2. Entry points on Medium before solving Easy return 403 CHALLENGE_LOCKED', async () => {
    // gameplayController.startSession
    const r1 = await request(app)
      .post(`/api/challenges/${mediumChallenge._id}/start-session`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ language: 'python' });

    expect(r1.status).toBe(403);
    expect(r1.body.code).toBe('CHALLENGE_LOCKED');
    expect(r1.body.requiredChallengeTitles).toContain('Easy Challenge Title');

    // sessionController.startSession
    const r2 = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${token1}`)
      .send({ challengeId: 'ch-medium-test', language: 'python' });

    expect(r2.status).toBe(403);
    expect(r2.body.code).toBe('CHALLENGE_LOCKED');

    // gameplayController.submitTaskAnswer
    const r3 = await request(app)
      .post(`/api/challenges/${mediumChallenge._id}/submit-task`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ answer: '4' });

    expect(r3.status).toBe(403);
    expect(r3.body.code).toBe('CHALLENGE_LOCKED');

    // submissionController.runCode (with challengeId)
    const r4 = await request(app)
      .post('/api/submissions/run')
      .set('Authorization', `Bearer ${token1}`)
      .send({ language: 'python', code: 'print(1)', challengeId: 'ch-medium-test' });

    expect(r4.status).toBe(403);
    expect(r4.body.code).toBe('CHALLENGE_LOCKED');

    // submissionController.submitSolution
    const r5 = await request(app)
      .post('/api/submissions/submit')
      .set('Authorization', `Bearer ${token1}`)
      .send({ language: 'python', code: 'print(1)', challengeId: 'ch-medium-test' });

    expect(r5.status).toBe(403);
    expect(r5.body.code).toBe('CHALLENGE_LOCKED');
  });

  test('3. Direct call to /api/challenges/:id for a locked challenge returns public metadata without leaking quiz answers or explain', async () => {
    const res = await request(app).get(`/api/challenges/${mediumChallenge.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.challenge.title).toBe('Medium Challenge Title');

    const quizPool = res.body.challenge.tasks?.[0]?.quizPool || [];
    if (quizPool.length > 0) {
      expect(quizPool[0].answer).toBeUndefined();
      expect(quizPool[0].explain).toBeUndefined();
    }
  });

  test('4. WRONG_ANSWER submission on Easy does NOT unlock Medium', async () => {
    // Record WRONG_ANSWER submission for Easy
    await Submission.create({
      userId: participant1._id,
      challengeId: easyChallenge._id,
      code: 'print("wrong")',
      language: 'python',
      status: 'WRONG_ANSWER',
    });

    const res = await request(app)
      .get('/api/challenges/progress')
      .set('Authorization', `Bearer ${token1}`);

    const med = res.body.progress.find((p) => p.slug === 'ch-medium-test');
    expect(med.status).toBe('LOCKED');
  });

  test('5. Admin endSession on Easy does NOT unlock Medium', async () => {
    // Set ParticipantSession to COMPLETED without an ACCEPTED submission
    await ParticipantSession.create({
      userId: participant1._id,
      challengeId: easyChallenge._id,
      status: 'COMPLETED',
      isCompleted: true,
      selectedLanguage: 'python',
      startTime: new Date(),
      endTime: new Date(),
    });

    const res = await request(app)
      .get('/api/challenges/progress')
      .set('Authorization', `Bearer ${token1}`);

    const med = res.body.progress.find((p) => p.slug === 'ch-medium-test');
    expect(med.status).toBe('LOCKED');
  });

  test('6. ACCEPTED submission on Easy unlocks Medium, but Hard is still LOCKED', async () => {
    // Record ACCEPTED submission for Easy
    await Submission.create({
      userId: participant1._id,
      challengeId: easyChallenge._id,
      code: 'print("correct")',
      language: 'python',
      status: 'ACCEPTED',
    });

    const res = await request(app)
      .get('/api/challenges/progress')
      .set('Authorization', `Bearer ${token1}`);

    const easy = res.body.progress.find((p) => p.slug === 'ch-easy-test');
    const med = res.body.progress.find((p) => p.slug === 'ch-medium-test');
    const hard = res.body.progress.find((p) => p.slug === 'ch-hard-test');

    expect(easy.status).toBe('COMPLETED');
    expect(med.status).toBe('UNLOCKED');
    expect(hard.status).toBe('LOCKED');
    expect(hard.requiredChallengeTitles).toContain('Medium Challenge Title');

    // Medium start-session now succeeds
    const startRes = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${token1}`)
      .send({ challengeId: 'ch-medium-test', language: 'python' });

    expect(startRes.status).toBe(200);
    expect(startRes.body.success).toBe(true);
  });

  test('7. ACCEPTED submission on Medium unlocks Hard', async () => {
    // Record ACCEPTED submission on Medium
    await Submission.create({
      userId: participant1._id,
      challengeId: mediumChallenge._id,
      code: 'print("medium solved")',
      language: 'python',
      status: 'ACCEPTED',
    });

    const res = await request(app)
      .get('/api/challenges/progress')
      .set('Authorization', `Bearer ${token1}`);

    const easy = res.body.progress.find((p) => p.slug === 'ch-easy-test');
    const med = res.body.progress.find((p) => p.slug === 'ch-medium-test');
    const hard = res.body.progress.find((p) => p.slug === 'ch-hard-test');

    expect(easy.status).toBe('COMPLETED');
    expect(med.status).toBe('COMPLETED');
    expect(hard.status).toBe('UNLOCKED');

    // Hard start-session now succeeds
    const hardStart = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${token1}`)
      .send({ challengeId: 'ch-hard-test', language: 'python' });

    expect(hardStart.status).toBe(200);
    expect(hardStart.body.success).toBe(true);
  });

  test('8. Admin token bypasses all locks', async () => {
    // Progress for admin reports all unlocked/accessible
    const res = await request(app)
      .get('/api/challenges/progress')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    res.body.progress.forEach((p) => {
      expect(p.status).not.toBe('LOCKED');
    });
  });

  test('9. Settings.enforceProgression = false unlocks everything for participants', async () => {
    // Register a brand new participant with 0 submissions
    const newPartRes = await request(app).post('/api/participants/register').send({
      name: 'Charlie Contestant',
      participantId: 'MC-CHARLIE-02',
      email: 'charlie@example.com',
      college: 'Polytechnic',
      department: 'IT',
    });
    const charlieToken = newPartRes.body.token;

    // Turn off progression in Settings
    await Settings.findOneAndUpdate({}, { enforceProgression: false });

    const progRes = await request(app)
      .get('/api/challenges/progress')
      .set('Authorization', `Bearer ${charlieToken}`);

    expect(progRes.status).toBe(200);
    expect(progRes.body.enforceProgression).toBe(false);

    const med = progRes.body.progress.find((p) => p.slug === 'ch-medium-test');
    const hard = progRes.body.progress.find((p) => p.slug === 'ch-hard-test');

    expect(med.status).toBe('UNLOCKED');
    expect(hard.status).toBe('UNLOCKED');

    // Can start hard session directly without 403
    const hardStart = await request(app)
      .post('/api/sessions/start')
      .set('Authorization', `Bearer ${charlieToken}`)
      .send({ challengeId: 'ch-hard-test', language: 'python' });

    expect(hardStart.status).toBe(200);
    expect(hardStart.body.success).toBe(true);
  });
});
