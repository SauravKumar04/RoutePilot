const express = require('express');
const { register, login, getMe, updatePreferences } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Pass references cleanly. Express will handle passing the req, res, and next arguments.
router.post('/register', register);
router.post('/login', login);
router.put('/preferences', protect, updatePreferences);

module.exports = router;