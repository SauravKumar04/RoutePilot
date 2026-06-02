const axios = require('axios');
const haversineDistance = require('../algorithms/haversine');

const osrmClient = axios.create({
  baseURL: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org',
});

const generateRoutingMatrix = async (locations, metric = 'distance') => {
  try {
    const coordinatesString = locations
      .map((loc) => `${loc.coordinates.lng},${loc.coordinates.lat}`)
      .join(';');

    const response = await osrmClient.get(`/table/v1/driving/${coordinatesString}`, {
      params: {
        annotations: metric,
      },
    });

    if (response.data.code !== 'Ok') {
      throw new Error('OSRM Table API returned non-Ok status');
    }

    const rawMatrix =
      metric === 'distance' ? response.data.distances : response.data.durations;

    return rawMatrix.map((row) =>
      row.map((val) => (metric === 'distance' ? val / 1000 : val))
    );
  } catch (error) {
    console.warn(
      '⚠️ OSRM Table API failed. Falling back to Haversine geographic matrix.',
      error.message
    );

    const matrix = [];

    for (let i = 0; i < locations.length; i++) {
      const row = [];

      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          row.push(0);
        } else {
          row.push(
            haversineDistance(locations[i].coordinates, locations[j].coordinates)
          );
        }
      }

      matrix.push(row);
    }

    return matrix;
  }
};

module.exports = { generateRoutingMatrix };