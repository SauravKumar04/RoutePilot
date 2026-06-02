const axios = require('axios');
const ApiError = require('../utils/ApiError');

const nominatimClient = axios.create({
  baseURL: process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org',
  headers: {
    'User-Agent': 'RoutePilotAI/1.0 (contact@yourdomain.com)',
  },
});

const geocodeAddress = async (address) => {
  try {
    const response = await nominatimClient.get('/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
      },
    });

    if (!response.data || response.data.length === 0) {
      throw new ApiError(404, `Address not found: ${address}`);
    }

    return {
      lat: parseFloat(response.data[0].lat),
      lng: parseFloat(response.data[0].lon),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Geocoding service unavailable');
  }
};

module.exports = { geocodeAddress };