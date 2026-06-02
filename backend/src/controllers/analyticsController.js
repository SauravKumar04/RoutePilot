const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const ApiResponse = require('../utils/ApiResponse');

const getAnalyticsSummary = async (req, res, next) => {
  try {
    const userIdString = req.user._id ? req.user._id.toString() : req.user.id;
    const userId = new mongoose.Types.ObjectId(userIdString);

    const result = await Trip.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$analytics.totalDistance' },
          originalDistance: { $sum: '$analytics.originalDistance' },
          totalDuration: { $sum: '$analytics.totalDuration' },
          originalDuration: { $sum: '$analytics.originalDuration' },
          estimatedFuelCost: { $sum: '$analytics.estimatedFuelCost' },
          originalFuelCost: { $sum: '$analytics.originalFuelCost' },
          optimizationSavings: { $sum: '$analytics.optimizationSavings' },
          totalLocations: {
            $sum: { $size: { $ifNull: ['$locations', []] } },
          },
          tripCount: { $sum: 1 },
        },
      },
    ]);

    const stats = result[0] || {
      totalDistance: 0,
      originalDistance: 0,
      totalDuration: 0,
      originalDuration: 0,
      estimatedFuelCost: 0,
      originalFuelCost: 0,
      optimizationSavings: 0,
      totalLocations: 0,
      tripCount: 0,
    };

    const baseDistance = stats.totalDistance + stats.optimizationSavings;
    const efficiencyIndex =
      baseDistance > 0
        ? `${((stats.optimizationSavings / baseDistance) * 100).toFixed(1)}%`
        : '0.0%';

    const trips = await Trip.find({
      user: userId,
      status: 'optimized',
    }).sort({ createdAt: 1 });

    const distanceData = trips.map((trip, index) => ({
      trip: `Trip ${index + 1}`,
      original: Number(
        trip.analytics.originalDistance?.toFixed?.(2) ??
          (trip.analytics.totalDistance + trip.analytics.optimizationSavings).toFixed(2)
      ),
      optimized: Number(trip.analytics.totalDistance.toFixed(2)),
    }));

    const fuelData = trips.map((trip, index) => {
      const fallbackOriginalDistance =
        trip.analytics.originalDistance ||
        trip.analytics.totalDistance + trip.analytics.optimizationSavings;

      const fallbackOriginalFuel =
        trip.analytics.originalFuelCost || (fallbackOriginalDistance / 15) * 1.5;

      const fuelSaved = fallbackOriginalFuel - trip.analytics.estimatedFuelCost;

      return {
        trip: `Trip ${index + 1}`,
        fuelSpent: Number(trip.analytics.estimatedFuelCost.toFixed(2)),
        fuelSaved: Number((fuelSaved > 0 ? fuelSaved : 0).toFixed(2)),
      };
    });

    const trueFuelSaved =
      stats.originalFuelCost > 0
        ? stats.originalFuelCost - stats.estimatedFuelCost
        : (stats.optimizationSavings / 15) * 1.5;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          distanceData,
          fuelData,
          meta: {
            totalSavedKm: Math.round(stats.optimizationSavings),
            netCapitalSaved: Math.round(trueFuelSaved > 0 ? trueFuelSaved : 0),
            efficiencyIndex,
            totalDistance: Math.round(stats.totalDistance),
            originalDistance: Math.round(stats.originalDistance),
            totalDuration: Math.round(stats.totalDuration),
            originalDuration: Math.round(stats.originalDuration),
            totalLocations: stats.totalLocations,
            tripCount: stats.tripCount,
            estimatedFuelCost: Math.round(stats.estimatedFuelCost),
          },
        },
        'Live operational data calculated successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalyticsSummary };