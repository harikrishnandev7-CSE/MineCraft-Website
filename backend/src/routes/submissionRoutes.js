const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

router.post('/run', submissionController.runCode);
router.post('/submit', submissionController.submitSolution);

module.exports = router;
