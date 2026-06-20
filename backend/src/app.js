const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'RoutePilot API is running',
  });
});

app.all('*', (req, res, next) => {
  const ApiError = require('./utils/ApiError');
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

app.use(errorHandler);

module.exports = app;