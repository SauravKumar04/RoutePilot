// backend/models/Trip.js
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
      trim: true,
    },
    date: {
      type: Date,
      default: null,
    },
    routeType: {
      type: String,
      enum: ['oneWay', 'roundTrip'],
      default: 'oneWay',
    },
    locations: [
      {
        name: { type: String, trim: true },
        address: { type: String, trim: true },
        coordinates: {
          lat: Number,
          lng: Number,
        },
        isStartNode: { type: Boolean, default: false },
        serviceTime: { type: Number, default: 10 },
        demand: { type: Number, default: 0 },
        timeWindowStart: { type: String, default: null }, // e.g. "09:00"
        timeWindowEnd: { type: String, default: null },   // e.g. "17:00"
        arrivalTime: { type: String, default: null },
        departureTime: { type: String, default: null },
        timeWindowViolated: { type: Boolean, default: false },
      },
    ],
    vehicleCapacity: {
      type: Number,
      default: 100,
    },
    enableCapacityConstraint: {
      type: Boolean,
      default: false,
    },
    enableTimeWindows: {
      type: Boolean,
      default: false,
    },
    departureTime: {
      type: String,
      default: '08:00', // e.g. "08:00"
    },
    routeGeometry: {
      type: String,
      default: '',
    },
    analytics: {
      totalDistance: { type: Number, default: 0 },
      originalDistance: { type: Number, default: 0 },
      totalDuration: { type: Number, default: 0 },
      originalDuration: { type: Number, default: 0 },
      timeSavings: { type: Number, default: 0 },
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
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);