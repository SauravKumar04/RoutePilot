const Trip = require('../models/Trip');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { optimizeTripRoute } = require('../services/optimizationService');

const createTrip = async (req, res, next) => {
  try {
    const { title, date, locations } = req.body;

    const trip = await Trip.create({
      user: req.user._id,
      title,
      date,
      locations: locations || [],
    });

    return res.status(201).json(
      new ApiResponse(201, trip, 'Trip created successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getMyTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(200, trips, 'Trips fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    return res.status(200).json(
      new ApiResponse(200, trip, 'Trip details fetched')
    );
  } catch (error) {
    next(error);
  }
};

const updateTrip = async (req, res, next) => {
  try {
    const updates = {
      ...req.body,
      status: 'draft',
      routeGeometry: null,
    };

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    return res.status(200).json(
      new ApiResponse(200, trip, 'Trip updated')
    );
  } catch (error) {
    next(error);
  }
};

const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Trip deleted permanently',
    });
  } catch (error) {
    next(error);
  }
};

const optimizeTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    const routeType = req.body.routeType || trip.routeType || 'oneWay';

    const optimizationResult = await optimizeTripRoute(
      trip,
      req.user.preferences || {},
      { routeType } 
    );

    trip.locations = optimizationResult.optimizedLocations;
    trip.routeGeometry = optimizationResult.routeGeometry;
    trip.analytics = optimizationResult.analytics;
    trip.routeType = routeType; 
    trip.status = 'optimized';

    await trip.save();

    return res.status(200).json(
      new ApiResponse(200, trip, 'Trip optimized successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrip,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  optimizeTrip,
};