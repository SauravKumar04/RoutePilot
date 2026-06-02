import polyline from '@mapbox/polyline';

/**
 * Decodes an encoded polyline string into an array of [lat, lng] coordinates.
 */
export const decodeRouteGeometry = (encodedString) => {
  if (!encodedString) return [];
  try {
    return polyline.decode(encodedString);
  } catch (error) {
    console.error("Failed to decode polyline", error);
    return [];
  }
};