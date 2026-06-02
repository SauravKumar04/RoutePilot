// backend/src/models/Trip.js
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      default: 'Active Route Workspace',
    },
    locations: [
      {
        name: String,
        address: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
        isStartNode: Boolean,
      },
    ],
    routeGeometry: {
      type: String, 
    },
    analytics: {
      totalDistance: { type: Number, default: 0 },    // The FINAL Optimized Distance
      originalDistance: { type: Number, default: 0 }, // NEW: The Unoptimized Distance
      totalDuration: { type: Number, default: 0 },
      estimatedFuelCost: { type: Number, default: 0 },
      originalFuelCost: { type: Number, default: 0 },
      optimizationSavings: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['draft', 'optimized', 'in_progress', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);