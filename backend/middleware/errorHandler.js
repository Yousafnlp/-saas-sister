import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function handleCastError(err) {
  return new AppError(`Invalid value for '${err.path}': ${err.value}`, 400);
}

function handleDuplicateKeyError(err) {
  const field = Object.keys(err.keyValue || {})[0];
  const value = field ? err.keyValue[field] : '';
  return new AppError(`Duplicate value for '${field}': '${value}' already exists`, 409);
}

function handleValidationError(err) {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
}

function handleJWTError() {
  return new AppError('Invalid authentication token. Please log in again.', 401);
}

function handleJWTExpiredError() {
  return new AppError('Your session has expired. Please log in again.', 401);
}

export function errorHandler(err, req, res, next) {
  let error = err;
  error.statusCode = error.statusCode || 500;
  error.message = error.message || 'Internal server error';

  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (!error.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
  }

  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.isOperational ? error.message : 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

export default errorHandler;
