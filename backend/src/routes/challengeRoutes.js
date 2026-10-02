const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const optionalAuth = require('../middleware/optionalAuth');
const protect = require('../middleware/authMiddleware');

router.get('/', challengeController.getChallenges);
router.get('/active', challengeController.getActiveChallenge);
router.get('/:id', challengeController.getChallengeById);
router.get('/:id/blocks', optionalAuth, challengeController.getParticipantBlocks);
router.post('/:id/reveal', optionalAuth, challengeController.revealBlock);

module.exports = router;
