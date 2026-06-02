const nearestNeighbor = (matrix, startIndex = 0) => {
  const n = matrix.length;
  if (n === 0) return [];

  const visited = new Array(n).fill(false);
  const route = [startIndex];
  visited[startIndex] = true;

  let currentIndex = startIndex;

  for (let i = 1; i < n; i++) {
    let nearestDist = Infinity;
    let nearestIndex = -1;

    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[currentIndex][j] < nearestDist) {
        nearestDist = matrix[currentIndex][j];
        nearestIndex = j;
      }
    }

    if (nearestIndex !== -1) {
      visited[nearestIndex] = true;
      route.push(nearestIndex);
      currentIndex = nearestIndex;
    }
  }

  return route;
};

module.exports = nearestNeighbor;