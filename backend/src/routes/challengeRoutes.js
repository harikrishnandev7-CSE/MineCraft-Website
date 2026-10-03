const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const gameplayController = require('../controllers/gameplayController');
const optionalAuth = require('../middleware/optionalAuth');
const protect = require('../middleware/authMiddleware');

// ── Public challenge info ──
router.get('/', challengeController.getChallenges);
router.get('/active', challengeController.getActiveChallenge);
router.get('/:id', challengeController.getChallengeById);
router.get('/:id/blocks', optionalAuth, challengeController.getParticipantBlocks);
router.post('/:id/reveal', optionalAuth, challengeController.revealBlock);

// ── Server-authoritative gameplay ──
router.post('/:id/start-session', optionalAuth, gameplayController.startSession);
router.get('/:id/current-task', optionalAuth, gameplayController.getCurrentTask);
router.post('/:id/submit-task', optionalAuth, gameplayController.submitTaskAnswer);
router.get('/:id/progress', optionalAuth, gameplayController.getProgress);

module.exports = router;

