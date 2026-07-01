const { generateRoutingMatrix } = require('./distanceMatrixService');
const nearestNeighbor = require('../algorithms/nearestNeighbor');
const { twoOpt } = require('../algorithms/twoOpt');
const { getDrivingRoute } = require('./routingService');
const { solveCVRP } = require('../algorithms/cvrpSolver');
const haversineDistance = require('../algorithms/haversine');
const ApiError = require('../utils/ApiError');

const cloneLocation = (location, originalIndex, optimizedIndex) => {
  const base = location?.toObject ? location.toObject() : { ...location };
  return { ...base, originalIndex, optimizedIndex };
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
    route.push({ ...route[0], optimizedIndex: route.length });
  }
  return route;
};

const safeRouteData = (fallback = {}) => ({
  distance: Number(fallback.distance || 0),
  duration: Number(fallback.duration || 0),
  geometry: fallback.geometry || '',
  legs: fallback.legs || [],
});

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return 480;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const formatMinutesToTime = (totalMinutes) => {
  const normalized = totalMinutes % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const getFallbackDuration = (loc1, loc2) => {
  const dist = haversineDistance(loc1.coordinates, loc2.coordinates);
  return (dist / 50) * 3600;
};

const computeMatrixRouteDistance = (indices, matrix) => {
  let total = 0;
  for (let i = 0; i < indices.length - 1; i++) {
    total += matrix[indices[i]]?.[indices[i + 1]] || 0;
  }
  return total;
};

const getCVRPRouteData = async (locations, subRoutes, matrix) => {
  let totalDistance = 0;
  let totalDuration = 0;
  let combinedLegs = [];
  let primaryGeometry = '';

  for (let i = 0; i < subRoutes.length; i++) {
    const subRouteLocations = subRoutes[i].map((idx) => locations[idx]);
    if (subRouteLocations.length < 2) continue;

    try {
      const routeData = await getDrivingRoute(subRouteLocations);
      totalDistance += routeData.distance;
      totalDuration += routeData.duration;
      combinedLegs = combinedLegs.concat(routeData.legs || []);
      if (routeData.geometry) {
        primaryGeometry = primaryGeometry ? `${primaryGeometry};${routeData.geometry}` : routeData.geometry;
      }
    } catch {
      const subDist = computeMatrixRouteDistance(subRoutes[i], matrix);
      totalDistance += subDist;
      totalDuration += (subDist / 50) * 3600;
    }
  }

  return { distance: totalDistance, duration: totalDuration, geometry: primaryGeometry, legs: combinedLegs };
};

const optimizeTripRoute = async (trip, userPreferences = {}, options = {}) => {
  const locations = (trip.locations || []).filter(
    (loc, idx) => idx === 0 || !loc.isStartNode
  );

  if (locations.length < 2) {
    throw new ApiError(400, 'At least two locations are required for optimization');
  }

  const objective = options.objective === 'duration' ? 'duration' : 'distance';
  const routeType = options.routeType === 'roundTrip' ? 'roundTrip' : 'oneWay';
  const enableCapacityConstraint = trip.enableCapacityConstraint || false;
  const enableTimeWindows = trip.enableTimeWindows || false;
  const vehicleCapacity = trip.vehicleCapacity || userPreferences.vehicleCapacity || 100;
  const departureTime = trip.departureTime || userPreferences.departureTime || '08:00';

  const startIndex =
    locations.findIndex((loc) => loc.isStartNode) !== -1
      ? locations.findIndex((loc) => loc.isStartNode)
      : 0;

  const matrix = await generateRoutingMatrix(locations, objective);

  let optimizedIndices = [];
  let subRoutes = [];

  if (enableCapacityConstraint) {
    const vrpResult = solveCVRP(matrix, locations, vehicleCapacity, startIndex);
    optimizedIndices = vrpResult.optimizedIndices;
    subRoutes = vrpResult.subRoutes;
  } else {
    const nnRoute = nearestNeighbor(matrix, startIndex);
    let tspIndices = twoOpt(nnRoute, matrix);
    optimizedIndices = rotateToStart(tspIndices, startIndex);

    if (routeType === 'roundTrip' && optimizedIndices.length > 0 && optimizedIndices[optimizedIndices.length - 1] !== optimizedIndices[0]) {
      optimizedIndices = [...optimizedIndices, optimizedIndices[0]];
    }
  }

  const originalOrderBase = Array.from({ length: locations.length }, (_, i) => i);
  const originalOrder = rotateToStart(originalOrderBase, startIndex);
  const includeReturnInOriginal = routeType === 'roundTrip' && !enableCapacityConstraint;

  const originalRouteLocations = buildRouteLocations(locations, originalOrder, includeReturnInOriginal);
  const optimizedRouteLocations = buildRouteLocations(locations, optimizedIndices, false);

  let originalRouteData = null;
  let optimizedRouteData = null;

  if (enableCapacityConstraint) {
    try { optimizedRouteData = await getCVRPRouteData(locations, subRoutes, matrix); } catch {}
    try { originalRouteData = await getDrivingRoute(buildRouteLocations(locations, originalOrderBase, false)); } catch {}
  } else {
    try { originalRouteData = await getDrivingRoute(originalRouteLocations); } catch {}
    try { optimizedRouteData = await getDrivingRoute(optimizedRouteLocations); } catch {}
  }

  if (!optimizedRouteData || optimizedRouteData.distance === 0) {
    const dist = computeMatrixRouteDistance(optimizedIndices, matrix);
    optimizedRouteData = safeRouteData({ distance: dist, duration: (dist / 50) * 3600, geometry: optimizedRouteData?.geometry || '', legs: optimizedRouteData?.legs || [] });
  }

  if (!originalRouteData || originalRouteData.distance === 0) {
    const dist = computeMatrixRouteDistance(originalOrder, matrix);
    originalRouteData = safeRouteData({ distance: dist, duration: (dist / 50) * 3600 });
  }

  let currentMinutes = parseTimeToMinutes(departureTime);

  if (optimizedRouteLocations.length > 0) {
    const first = optimizedRouteLocations[0];
    if (enableTimeWindows) {
      first.arrivalTime = departureTime;
      first.departureTime = formatMinutesToTime(currentMinutes + (first.serviceTime || 0));
    }
    currentMinutes += first.serviceTime || 0;
  }

  for (let j = 1; j < optimizedRouteLocations.length; j++) {
    const prev = optimizedRouteLocations[j - 1];
    const curr = optimizedRouteLocations[j];
    const legSeconds = optimizedRouteData.legs?.[j - 1]?.duration ?? getFallbackDuration(prev, curr);
    currentMinutes += Math.round(legSeconds / 60);

    if (enableTimeWindows) {
      if (curr.timeWindowStart) {
        const startMin = parseTimeToMinutes(curr.timeWindowStart);
        if (currentMinutes < startMin) currentMinutes = startMin;
      }
      if (curr.timeWindowEnd) {
        const endMin = parseTimeToMinutes(curr.timeWindowEnd);
        if (currentMinutes > endMin) curr.timeWindowViolated = true;
      }
      curr.arrivalTime = formatMinutesToTime(currentMinutes);
      curr.departureTime = formatMinutesToTime(currentMinutes + (curr.serviceTime || 0));
    }

    currentMinutes += curr.serviceTime || 0;
  }

  const totalServiceTimeSeconds = locations.reduce((acc, loc, i) => {
    if (i === startIndex) return acc;
    return acc + (Number(loc.serviceTime) || 0) * 60;
  }, 0);

  const fuelPrice = Number(userPreferences.fuelPrice) > 0 ? Number(userPreferences.fuelPrice) : 1.5;
  const kmPerLiter = Number(userPreferences.averageFuelConsumption) > 0 ? Number(userPreferences.averageFuelConsumption) : 15;

  const optimizedFuelCost = (optimizedRouteData.distance / kmPerLiter) * fuelPrice;
  const originalFuelCost = (originalRouteData.distance / kmPerLiter) * fuelPrice;
  const optimizationSavings = Math.max(0, originalRouteData.distance - optimizedRouteData.distance);
  const timeSavings = Math.max(0, originalRouteData.duration - optimizedRouteData.duration);

  let optimizedLocations;
  if (enableCapacityConstraint) {
    optimizedLocations = optimizedRouteLocations;
  } else {
    const uniqueIndices =
      routeType === 'roundTrip' && optimizedIndices.length > 1
        ? optimizedIndices.slice(0, -1)
        : optimizedIndices;
    optimizedLocations = uniqueIndices.map((originalIdx, newIdx) => {
      const cloned = cloneLocation(locations[originalIdx], originalIdx, newIdx);
      const match = optimizedRouteLocations.find((l) => l.originalIndex === originalIdx);
      if (match && enableTimeWindows) {
        cloned.arrivalTime = match.arrivalTime;
        cloned.departureTime = match.departureTime;
        cloned.timeWindowViolated = match.timeWindowViolated;
      }
      return cloned;
    });
  }

  return {
    optimizedLocations,
    routeGeometry: optimizedRouteData.geometry,
    analytics: {
      objective,
      routeType,
      totalDistance: Number(optimizedRouteData.distance.toFixed(1)) || 0,
      originalDistance: Number(originalRouteData.distance.toFixed(1)) || 0,
      totalDuration: Number(optimizedRouteData.duration) + totalServiceTimeSeconds,
      originalDuration: Number(originalRouteData.duration) + totalServiceTimeSeconds,
      timeSavings: Number(timeSavings.toFixed(0)) || 0,
      estimatedFuelCost: Number(optimizedFuelCost.toFixed(2)) || 0,
      originalFuelCost: Number(originalFuelCost.toFixed(2)) || 0,
      optimizationSavings: Number(optimizationSavings.toFixed(1)) || 0,
    },
  };
};

module.exports = { optimizeTripRoute };