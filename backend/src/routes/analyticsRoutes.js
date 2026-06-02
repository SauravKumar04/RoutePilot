const express = require('express');
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/summary', protect, getAnalyticsSummary);

module.exports = router;