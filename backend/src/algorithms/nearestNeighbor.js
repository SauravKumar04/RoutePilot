/**
 * Generates an initial fast route using the Nearest Neighbor algorithm.
 * O(n^2) complexity, provides a good starting point for 2-Opt.
 * @param {Array<Array<Number>>} matrix - Distance matrix
 * @param {Number} startIndex - Index of the starting location
 * @returns {Array<Number>} Array of location indices in visited order
 */
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