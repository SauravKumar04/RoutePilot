// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorMiddleware');

// 1. IMPORT SUB-ROUTERS (Crucial fix for resolving the 404 error)
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

// 2. CONFIGURE CORE CORS POLICIES
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. HANDSHAKE PREFLIGHT INTERCEPTOR (Express 4 compatible)
app.options('*', cors()); 

// 4. GLOBAL SECURITY & LOGGING MIDDLEWARES
app.use(helmet({
  crossOriginResourcePolicy: false, // Essential to prevent blocking Leaflet map tile graphics
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 5. BODY PARSERS (Must be declared BEFORE route mounting)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. MOUNT PRODUCTION API ROUTERS
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// 7. BASELINE PLATFORM HEALTH RECONCILIATION
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'RoutePilot AI API is running' });
});

// 8. GLOBAL CATCH-ALL 404 ROUTE (Must be declared AFTER route mounting)
app.all('*', (req, res, next) => {
  const ApiError = require('./utils/ApiError');
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

// 9. CENTRALIZED EXCEPTION LAYER
app.use(errorHandler);

module.exports = app;