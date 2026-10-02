const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const optionalAuth = require('../middleware/optionalAuth');

router.post('/run', optionalAuth, submissionController.runCode);
router.post('/submit', optionalAuth, submissionController.submitSolution);
router.post('/', optionalAuth, submissionController.submitSolution);
router.get('/:id', optionalAuth, submissionController.getSubmissionById);
router.get('/history/:challengeId', optionalAuth, submissionController.getUserHistory);

module.exports = router;
