import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './config/database.js';
import { clerkAuthMiddleware, requireAuth, optionalAuth } from './middleware/clerkAuth.js';
import { authorize } from './middleware/authorize.js';
import { validate } from './middleware/validate.js';
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
} from './middleware/errorHandler.js';
import { z } from 'zod';
import propertyRoutes from './routes/property.routes.js';




dotenv.config();

const app = express();


const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkAuthMiddleware);

app.get('/api/health', async (req, res) => {
  try {
    const userCount = await prisma.user.count();

    res.status(200).json({
      status: 'OK',
      message: 'SkyBridge Travels API is running',
      database: 'connected',
      users: userCount,
      environment: NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Database connection failed',
      database: 'disconnected',
      error: error.message,
      environment: NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/test/auth', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    auth: {
      userId: req.auth.userId,
      sessionId: req.auth.sessionId,
      orgId: req.auth.orgId,
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/optional-auth', optionalAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Public route accessed',
    authenticated: req.auth ? true : false,
    auth: req.auth ? {
      userId: req.auth.userId,
      sessionId: req.auth.sessionId,
    } : null,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/customer', requireAuth, authorize('CUSTOMER'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Customer route accessed successfully',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    },
    requiredRole: 'CUSTOMER',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/owner', requireAuth, authorize('HOTEL_OWNER'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Hotel owner route accessed successfully',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    },
    requiredRole: 'HOTEL_OWNER',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/admin', requireAuth, authorize('ADMIN'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin route accessed successfully',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    },
    requiredRole: 'ADMIN',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/admin-or-owner', requireAuth, authorize('ADMIN', 'HOTEL_OWNER'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin or Hotel Owner route accessed successfully',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName
    },
    requiredRoles: ['ADMIN', 'HOTEL_OWNER'],
    timestamp: new Date().toISOString()
  });
});

const testValidationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format').optional(),
  age: z.number().int().min(18, 'Must be at least 18 years old').optional()
});

app.post('/api/test/validate', validate(testValidationSchema), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Validation passed',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

const queryValidationSchema = z.object({
  search: z.string().min(2, 'Search must be at least 2 characters'),
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional()
});

app.get('/api/test/validate-query', validate(queryValidationSchema, 'query'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Query validation passed',
    query: req.query,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/error/generic', (req, res, next) => {
  const error = new Error('This is a generic server error');
  next(error);
});

app.get('/api/test/error/validation', (req, res, next) => {
  next(new ValidationError('Invalid input data provided'));
});

app.get('/api/test/error/auth', (req, res, next) => {
  next(new AuthenticationError('Invalid or missing authentication token'));
});

app.get('/api/test/error/forbidden', (req, res, next) => {
  next(new AuthorizationError('You do not have permission to access this resource'));
});

app.get('/api/test/error/notfound', (req, res, next) => {
  next(new NotFoundError('The requested resource was not found'));
});

app.get('/api/test/error/conflict', (req, res, next) => {
  next(new ConflictError('Resource already exists'));
});

app.get('/api/test/error/custom', (req, res, next) => {
  const error = new Error('Custom error with specific status');
  error.statusCode = 418;
  next(error);
});

app.get('/api/test/error/detailed', (req, res, next) => {
  const error = new ValidationError('Multiple validation errors');
  error.details = [
    { field: 'email', message: 'Invalid email format' },
    { field: 'age', message: 'Must be at least 18 years old' }
  ];
  next(error);
});

app.get('/api/test/error/async', asyncHandler(async (req, res) => {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Async operation failed'));
    }, 100);
  });
}));

app.get('/api/test/error/database', asyncHandler(async (req, res) => {
  throw new Error('Database connection failed');
}));

app.use('/api/properties', propertyRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`SkyBridge Travels API Server`);
  console.log('='.repeat(50));
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Accepting requests from: ${CLIENT_URL}`);
  console.log('='.repeat(50));
  console.log(`Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  if (NODE_ENV === 'development') {
    console.log('Tip: Server will auto-restart on file changes (nodemon)');
  }
  console.log('');
});