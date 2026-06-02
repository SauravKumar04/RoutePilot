const express = require('express');
const {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  optimizeTrip,
} = require('../controllers/tripController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createTrip).get(getMyTrips);

router
  .route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

router.post('/:id/optimize', optimizeTrip);

module.exports = router;