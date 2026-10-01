const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

router.post('/scan', qrController.scanBlock);
router.get('/scanned/:challengeId', qrController.getScannedBlocks);

module.exports = router;
