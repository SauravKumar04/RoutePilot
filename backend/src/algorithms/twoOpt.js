const calculateRouteDistance = (route, matrix) => {
  let distance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    distance += matrix[route[i]][route[i + 1]];
  }

  return distance;
};

const twoOpt = (route, matrix) => {
  let improvement = true;
  let bestRoute = [...route];
  let bestDistance = calculateRouteDistance(bestRoute, matrix);

  while (improvement) {
    improvement = false;

    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let j = i + 1; j < bestRoute.length - 1; j++) {
        const newRoute = [
          ...bestRoute.slice(0, i),
          ...bestRoute.slice(i, j + 1).reverse(),
          ...bestRoute.slice(j + 1),
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