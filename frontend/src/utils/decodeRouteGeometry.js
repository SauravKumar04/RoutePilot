import polyline from '@mapbox/polyline';

export const decodeRouteGeometry = (encodedString) => {
  if (!encodedString) return [];

  try {
    return polyline.decode(encodedString);
  } catch (error) {
    console.error('Failed to decode polyline', error);
    return [];
  }
};