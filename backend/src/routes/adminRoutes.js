const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

router.use(protect, requireAdmin);

router.get('/overview', adminController.getOverview);
router.get('/participants', adminController.getParticipants);
router.post('/challenges', adminController.createChallenge);
router.put('/challenges/:id', adminController.updateChallenge);
router.get('/sessions', adminController.getSessions);
router.get('/submissions', adminController.getSubmissions);
router.put('/settings', adminController.updateSettings);

module.exports = router;
