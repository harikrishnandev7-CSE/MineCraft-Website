const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const protect = require('../middleware/authMiddleware');

router.post('/run', protect, submissionController.runCode);
router.post('/submit', protect, submissionController.submitSolution);
router.post('/', protect, submissionController.submitSolution);
router.get('/:id', protect, submissionController.getSubmissionById);
router.get('/history/:challengeId', protect, submissionController.getUserHistory);

module.exports = router;
