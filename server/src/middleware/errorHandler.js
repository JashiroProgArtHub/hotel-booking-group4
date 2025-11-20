export class ValidationError extends Error {
  constructor(message = 'Validation failed', details = null) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    if (details) {
      this.details = details;
    }
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access forbidden') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export const errorHandler = (err, req, res, next) => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const isDevelopment = NODE_ENV === 'development';

  if (isDevelopment) {
    console.error('\n' + '='.repeat(80));
    console.error('ERROR CAUGHT BY ERROR HANDLER:');
    console.error('='.repeat(80));
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Status:', err.statusCode || err.status || 500);
    console.error('Path:', req.method, req.originalUrl);
    console.error('Time:', new Date().toISOString());
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
    console.error('='.repeat(80) + '\n');
  }

  const statusCode = err.statusCode || err.status || 500;

  const errorResponse = {
    success: false,
    error: err.message || 'Internal server error',
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  };

  if (isDevelopment) {
    errorResponse.errorType = err.name;
    errorResponse.path = req.originalUrl;
    errorResponse.method = req.method;
  }

  if (isDevelopment && err.stack) {
    errorResponse.stack = err.stack.split('\n').map(line => line.trim());
  }

  if (err.details) {
    errorResponse.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};

export const notFoundHandler = (req, res) => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const isDevelopment = NODE_ENV === 'development';

  const response = {
    success: false,
    error: 'Route not found',
    statusCode: 404,
    timestamp: new Date().toISOString()
  };

  if (isDevelopment) {
    response.path = req.originalUrl;
    response.method = req.method;
  }

  res.status(404).json(response);
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
