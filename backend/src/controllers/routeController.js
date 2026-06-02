const Trip = require('../models/Trip');
const { optimizeTripRoute } = require('../services/optimizationService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Optimize route for a specific trip
// @route   POST /api/v1/trips/:id/optimize
// @access  Private
const optimizeRoute = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!trip) throw new ApiError(404, 'Trip not found');
    
    // User preferences dictate fuel cost algorithms
    const preferences = req.user.preferences || { averageFuelConsumption: 15, fuelPrice: 1.5 };

    // Run Optimization Engine
    const optimizationResult = await optimizeTripRoute(trip, preferences);

    // Update Database with Results
    trip.locations = optimizationResult.optimizedLocations;
    trip.routeGeometry = optimizationResult.routeGeometry;
    trip.analytics = optimizationResult.analytics;
    trip.status = 'optimized';

    await trip.save();

    res.status(200).json(
      new ApiResponse(200, trip, 'Route optimized successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { optimizeRoute };