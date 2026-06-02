const haversineDistance = require('./haversine');

const generateDistanceMatrix = (locations) => {
  const matrix = [];
  for (let i = 0; i < locations.length; i++) {
    const row = [];
    for (let j = 0; j < locations.length; j++) {
      if (i === j) {
        row.push(0);
      } else {
        row.push(haversineDistance(locations[i].coordinates, locations[j].coordinates));
      }
    }
    matrix.push(row);
  }
  return matrix;
};

module.exports = generateDistanceMatrix;