import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { prisma } from './config/database.js';
import { clerkAuthMiddleware } from './middleware/clerkAuth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import propertyRoutes from './routes/property.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import clerkRoutes from './routes/clerk.routes.js';
import adminRoutes from './routes/admin.routes.js';




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
app.use('/api/clerk', clerkRoutes);

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

app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

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