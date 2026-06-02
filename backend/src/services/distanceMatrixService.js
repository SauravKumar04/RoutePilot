// backend/src/services/distanceMatrixService.js
const axios = require('axios');
const haversineDistance = require('../algorithms/haversine'); // Your existing utility

const osrmClient = axios.create({
  baseURL: process.env.OSRM_BASE_URL || 'http://router.project-osrm.org',
});

/**
 * Generates an NxN matrix using OSRM Table API with a Haversine fallback.
 * @param {Array} locations - Array of objects containing { coordinates: { lat, lng } }
 * @param {String} metric - 'distance' or 'duration' (for future extensibility)
 * @returns {Array<Array<Number>>} 2D array of distances in km (or durations in sec)
 */
const generateRoutingMatrix = async (locations, metric = 'distance') => {
  try {
    // OSRM expects: lng,lat;lng,lat...
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

    // OSRM returns distances in meters. We need kilometers to match the existing system algorithms.
    const rawMatrix = metric === 'distance' ? response.data.distances : response.data.durations;

    // Normalize matrix to KM if distance is requested
    const matrix = rawMatrix.map(row => 
      row.map(val => (metric === 'distance' ? val / 1000 : val))
    );

    return matrix;

  } catch (error) {
    console.warn('⚠️ OSRM Table API failed. Falling back to Haversine geographic matrix.', error.message);
    
    // Fallback: Generate Haversine Matrix locally if API limits are hit or network fails
    const matrix = [];
    for (let i = 0; i < locations.length; i++) {
      const row = [];
      for (let j = 0; j < locations.length; j++) {
        if (i === j) {
          row.push(0);
        } else {
          row.push(haversineDistance(locations[i].coordinates, locations[j].coordinates));
        }
      }
      matrix.push(row);
    }
    
    return matrix;
  }
};

module.exports = { generateRoutingMatrix };