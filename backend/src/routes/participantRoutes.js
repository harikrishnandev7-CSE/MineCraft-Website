const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');

router.post('/register', participantController.registerParticipant);
router.post('/join', participantController.registerParticipant);
router.get('/status', participantController.getStatus);

module.exports = router;
