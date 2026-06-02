/**
 * Calculates the straight-line distance between two points on Earth.
 * Used to quickly generate a distance matrix without hitting rate limits on external APIs.
 */
const toRad = (value) => (value * Math.PI) / 180;

const haversineDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

module.exports = haversineDistance;