const { twoOpt } = require('./twoOpt');

const solveCVRP = (matrix, locations, capacity, startIndex = 0) => {
  const n = matrix.length;
  if (n === 0) return { optimizedIndices: [], subRoutes: [] };

  const safeCapacity = Number(capacity) > 0 ? Number(capacity) : 100;
  const unvisited = new Set(
    Array.from({ length: n }, (_, i) => i).filter((i) => i !== startIndex)
  );
  const subRoutes = [];

  while (unvisited.size > 0) {
    const route = [startIndex];
    let remainingCapacity = safeCapacity;
    let currentLoc = startIndex;

    while (unvisited.size > 0) {
      let nearestDist = Infinity;
      let nearestIndex = -1;

      for (const node of unvisited) {
        const nodeDemand = Math.min(Number(locations[node].demand) || 0, safeCapacity);
        if (nodeDemand <= remainingCapacity) {
          const dist = matrix[currentLoc][node];
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIndex = node;
          }
        }
      }

      if (nearestIndex !== -1) {
        route.push(nearestIndex);
        remainingCapacity -= Math.min(Number(locations[nearestIndex].demand) || 0, safeCapacity);
        unvisited.delete(nearestIndex);
        currentLoc = nearestIndex;
      } else {
        break;
      }
    }

    route.push(startIndex);
    if (route.length > 2) subRoutes.push(twoOpt(route, matrix));
  }

  const optimizedIndices = [];
  subRoutes.forEach((route, i) => {
    optimizedIndices.push(...(i === 0 ? route : route.slice(1)));
  });

  if (optimizedIndices.length === 0) optimizedIndices.push(startIndex);

  return { optimizedIndices, subRoutes };
};

module.exports = { solveCVRP };
