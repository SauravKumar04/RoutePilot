/**
 * Calculates the total distance of a given route using the matrix.
 */
const calculateRouteDistance = (route, matrix) => {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    distance += matrix[route[i]][route[i + 1]];
  }
  // To make it a closed loop, add distance from last to first
  // distance += matrix[route[route.length - 1]][route[0]]; 
  return distance;
};

/**
 * 2-Opt Algorithm to optimize the route.
 * Iteratively uncrosses paths by reversing segments of the route.
 * @param {Array<Number>} route - Initial route indices (from Nearest Neighbor)
 * @param {Array<Array<Number>>} matrix - Distance matrix
 * @returns {Array<Number>} Optimized route indices
 */
const twoOpt = (route, matrix) => {
  let improvement = true;
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(bestRoute, matrix);

  while (improvement) {
    improvement = false;
    
    // Start at 1 to keep the start node fixed
    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        // Reverse the segment between i and j
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, j + 1).reverse(),
          ...bestRoute.slice(j + 1)
        ];

        const newDistance = calculateRouteDistance(newRoute, matrix);

        if (newDistance < bestDistance) {
          bestRoute = newRoute;
          bestDistance = newDistance;
          improvement = true;
        }
      }
    }
  }

  return bestRoute;
};

module.exports = { twoOpt, calculateRouteDistance };