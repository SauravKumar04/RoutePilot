const axios = require('axios');

const osrmClient = axios.create({
  baseURL: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org',
  timeout: 8000,
});

const getDrivingRoute = async (locations) => {
  if (!locations || locations.length < 2) {
    throw new Error('getDrivingRoute requires at least 2 locations');
  }

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
    throw new Error(`OSRM routing failed: ${response.data.code}`);
  }

  const route = response.data.routes[0];

  return {
    distance: route.distance / 1000, // meters → km
    duration: route.duration,        // seconds
    geometry: route.geometry,
    legs: route.legs
      ? route.legs.map((leg) => ({
          distance: leg.distance / 1000,
          duration: leg.duration,
        }))
      : [],
  };
};

module.exports = { getDrivingRoute };