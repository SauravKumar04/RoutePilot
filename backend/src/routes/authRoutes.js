const express = require('express');
const {
  register,
  login,
  updatePreferences,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/preferences', protect, updatePreferences);

module.exports = router;