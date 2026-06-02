const axios = require('axios');
const ApiError = require('../utils/ApiError');

const osrmClient = axios.create({
  baseURL: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org',
});

/**
 * Gets real-world driving route between a sequence of coordinates.
 * Coordinates must be ordered appropriately before calling.
 */
const getDrivingRoute = async (locations) => {
  try {
    // OSRM requires format: lng,lat;lng,lat;...
    const coordinatesString = locations
      .map((loc) => `${loc.coordinates.lng},${loc.coordinates.lat}`)
      .join(';');

    const response = await osrmClient.get(`/route/v1/driving/${coordinatesString}`, {
      params: {
        overview: 'full',      // Get the full polyline
        geometries: 'polyline', // Encoded string format
        steps: false,
      },
    });

    if (response.data.code !== 'Ok') {
      throw new ApiError(400, 'Could not calculate route via OSRM');
    }

    const route = response.data.routes[0];
    
    return {
      distance: route.distance / 1000, // Convert meters to km
      duration: route.duration,        // Seconds
      geometry: route.geometry,        // Encoded polyline for frontend MapView
    };
  } catch (error) {
    throw new ApiError(500, 'Routing service unavailable');
  }
};

module.exports = { getDrivingRoute };