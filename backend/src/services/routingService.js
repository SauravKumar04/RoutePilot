const axios = require('axios');
const ApiError = require('../utils/ApiError');

const osrmClient = axios.create({
  baseURL: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org',
});

const getDrivingRoute = async (locations) => {
  try {
    const coordinatesString = locations
      .map((loc) => `${loc.coordinates.lng},${loc.coordinates.lat}`)
      .join(';');

    const response = await osrmClient.get(`/route/v1/driving/${coordinatesString}`, {
      params: {
        overview: 'full',
        geometries: 'polyline',
        steps: false,
      },
    });

    if (response.data.code !== 'Ok') {
      throw new ApiError(400, 'Could not calculate route via OSRM');
    }

    const route = response.data.routes[0];

    return {
      distance: route.distance / 1000,
      duration: route.duration,
      geometry: route.geometry,
    };
  } catch (error) {
    throw new ApiError(500, 'Routing service unavailable');
  }
};

module.exports = { getDrivingRoute };