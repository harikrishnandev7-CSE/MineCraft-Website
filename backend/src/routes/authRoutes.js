const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.get('/me', protect, authController.getMe);
router.post('/logout', authController.logout);

module.exports = router;
