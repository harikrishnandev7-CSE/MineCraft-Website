const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');

router.get('/', challengeController.getChallenges);
router.get('/active', challengeController.getActiveChallenge);
router.get('/:id', challengeController.getChallengeById);

module.exports = router;
