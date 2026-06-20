export const formatDistance = (kilometers, unit = 'km') => {
  if (kilometers === undefined || kilometers === null || isNaN(kilometers)) {
    return unit === 'mi' ? '0 mi' : '0 km';
  }

  if (unit === 'mi') {
    const miles = kilometers * 0.621371;
    if (miles < 1) return `${Math.round(miles * 5280)} ft`;
    return `${miles.toFixed(1)} mi`;
  }

  if (kilometers < 1) return `${Math.round(kilometers * 1000)} m`;
  return `${kilometers.toFixed(1)} km`;
};