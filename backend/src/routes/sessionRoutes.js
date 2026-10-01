const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const protect = require('../middleware/authMiddleware');

router.get('/my-sessions', protect, sessionController.getUserSessions);

module.exports = router;
