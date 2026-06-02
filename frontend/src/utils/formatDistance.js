/**
 * Formats a raw kilometer metric into a clean, human-readable string.
 * @param {number} kilometers - The distance value in kilometers.
 * @returns {string} Formatted distance string.
 */
export const formatDistance = (kilometers) => {
  if (kilometers === undefined || kilometers === null || isNaN(kilometers)) {
    return '0 km';
  }
  
  if (kilometers < 1) {
    const meters = Math.round(kilometers * 1000);
    return `${meters} m`;
  }
  
  return `${kilometers.toFixed(1)} km`;
};