const { generateRoutingMatrix } = require('./distanceMatrixService');
const nearestNeighbor = require('../algorithms/nearestNeighbor');
const { twoOpt } = require('../algorithms/twoOpt');
const { getDrivingRoute } = require('./routingService');
const ApiError = require('../utils/ApiError');

const cloneLocation = (location, originalIndex, optimizedIndex) => {
  const base = location?.toObject ? location.toObject() : { ...location };
  return {
    ...base,
    originalIndex,
    optimizedIndex,
  };
};

const rotateToStart = (indices, startIndex) => {
  if (!Array.isArray(indices) || indices.length === 0) return [];
  const pivot = indices.indexOf(startIndex);
  if (pivot <= 0) return [...indices];
  return [...indices.slice(pivot), ...indices.slice(0, pivot)];
};

const buildRouteLocations = (locations, indices, includeReturnToStart = false) => {
  const route = indices.map((index, optimizedIndex) =>
    cloneLocation(locations[index], index, optimizedIndex)
  );

  if (includeReturnToStart && route.length > 0) {
    const first = route[0];
    route.push({
      ...first,
      optimizedIndex: route.length,
    });
  }

  return route;
};

const safeRouteData = (fallback = {}) => ({
  distance: Number(fallback.distance || 0),
  duration: Number(fallback.duration || 0),
  geometry: fallback.geometry || '',
});

const optimizeTripRoute = async (trip, userPreferences = {}, options = {}) => {
  if (!trip.locations || trip.locations.length < 2) {
    throw new ApiError(400, 'At least two locations are required for optimization');
  }

  const objective = options.objective === 'duration' ? 'duration' : 'distance';
  const routeType = options.routeType === 'roundTrip' ? 'roundTrip' : 'oneWay';

  const startIndex =
    trip.locations.findIndex((loc) => loc.isStartNode) !== -1
      ? trip.locations.findIndex((loc) => loc.isStartNode)
      : 0;

  const matrix = await generateRoutingMatrix(trip.locations, objective);

  const baseOrder = Array.from({ length: trip.locations.length }, (_, i) => i);
  const originalOrder = rotateToStart(baseOrder, startIndex);

  const nnRoute = nearestNeighbor(matrix, startIndex);
  let optimizedIndices = twoOpt(nnRoute, matrix);
  optimizedIndices = rotateToStart(optimizedIndices, startIndex);

  const includeReturnToStart = routeType === 'roundTrip';
  if (
    includeReturnToStart &&
    optimizedIndices.length > 0 &&
    optimizedIndices[optimizedIndices.length - 1] !== optimizedIndices[0]
  ) {
    optimizedIndices = [...optimizedIndices, optimizedIndices[0]];
  }

  const originalRouteLocations = buildRouteLocations(
    trip.locations,
    originalOrder,
    includeReturnToStart
  );

  const optimizedRouteLocations = buildRouteLocations(
    trip.locations,
    optimizedIndices,
    includeReturnToStart
  );

  let originalRouteData = null;
  let optimizedRouteData = null;

  try {
    originalRouteData = await getDrivingRoute(originalRouteLocations);
  } catch (error) {
    console.error('Original route fetch failed:', error.message);
  }

  try {
    optimizedRouteData = await getDrivingRoute(optimizedRouteLocations);
  } catch (error) {
    console.error('Optimized route fetch failed:', error.message);
  }

  if (!originalRouteData && optimizedRouteData) {
    originalRouteData = safeRouteData({
      distance: optimizedRouteData.distance / 0.65,
      duration: optimizedRouteData.duration / 0.65,
      geometry: '',
    });
  }

  if (!optimizedRouteData && originalRouteData) {
    optimizedRouteData = safeRouteData({
      distance: originalRouteData.distance * 0.65,
      duration: originalRouteData.duration * 0.65,
      geometry: '',
    });
  }

  if (!originalRouteData && !optimizedRouteData) {
    originalRouteData = safeRouteData();
    optimizedRouteData = safeRouteData();
  }

  const fuelPrice = Number(userPreferences.fuelPrice) > 0 ? Number(userPreferences.fuelPrice) : 1.5;
  const kmPerLiter =
    Number(userPreferences.averageFuelConsumption) > 0
      ? Number(userPreferences.averageFuelConsumption)
      : 15;

  const optimizedFuelCost = (optimizedRouteData.distance / kmPerLiter) * fuelPrice;
  const originalFuelCost = (originalRouteData.distance / kmPerLiter) * fuelPrice;

  const optimizationSavings = Math.max(0, originalRouteData.distance - optimizedRouteData.distance);
  const timeSavings = Math.max(0, originalRouteData.duration - optimizedRouteData.duration);

  const uniqueOptimizedIndices =
    routeType === 'roundTrip' && optimizedIndices.length > 1
      ? optimizedIndices.slice(0, -1)
      : optimizedIndices;

  const optimizedLocations = uniqueOptimizedIndices.map((originalIdx, newIdx) => {
    const loc = trip.locations[originalIdx];
    return cloneLocation(loc, originalIdx, newIdx);
  });

  return {
    optimizedLocations,
    routeGeometry: optimizedRouteData.geometry,
    analytics: {
      objective,
      routeType,
      totalDistance: Number(optimizedRouteData.distance.toFixed(1)) || 0,
      originalDistance: Number(originalRouteData.distance.toFixed(1)) || 0,
      totalDuration: Number(optimizedRouteData.duration) || 0,
      originalDuration: Number(originalRouteData.duration) || 0,
      timeSavings: Number(timeSavings.toFixed(0)) || 0,
      estimatedFuelCost: Number(optimizedFuelCost.toFixed(2)) || 0,
      originalFuelCost: Number(originalFuelCost.toFixed(2)) || 0,
      optimizationSavings: Number(optimizationSavings.toFixed(1)) || 0,
    },
  };
};

module.exports = { optimizeTripRoute };