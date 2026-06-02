// backend/src/middlewares/errorMiddleware.js
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // CRUCIAL: Always dump the actual stack trace to the terminal so developers can see it
  console.error("\n=== BACKEND CRASH DETECTED ===");
  console.error(err.stack || err);
  console.error("==============================\n");

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;