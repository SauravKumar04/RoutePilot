// backend/src/routes/tripRoutes.js
const express = require('express');

// 1. Import ALL functions from your updated tripController (including optimizeTrip)
const { 
  createTrip, 
  getMyTrips, 
  getTripById, 
  updateTrip, 
  optimizeTrip 
} = require('../controllers/tripController');

const { protect } = require('../middlewares/authMiddleware');
const Trip = require('../models/Trip'); // Required for the delete function

const router = express.Router();

// Apply auth middleware to all trip routes
router.use(protect);

// Routes for /api/v1/trips
router.route('/')
  .post(createTrip)
  .get(getMyTrips);

// Routes for /api/v1/trips/:id
router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  // 2. ADD THE DELETE ROUTE HERE so the My Trips page can delete workspaces
  .delete(async (req, res, next) => {
    try {
      const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
      if (!trip) {
        return res.status(404).json({ success: false, message: 'Trip not found' });
      }
      res.status(200).json({ success: true, message: 'Trip deleted permanently' });
    } catch (err) { 
      next(err); 
    }
  });

// 3. Connect the optimization route to our bulletproof optimizeTrip function
router.post('/:id/optimize', optimizeTrip);

module.exports = router;