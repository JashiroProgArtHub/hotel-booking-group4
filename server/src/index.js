import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

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

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SkyBridge Travels API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  if (NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 SkyBridge Travels API Server`);
  console.log('='.repeat(50));
  console.log(`📡 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Accepting requests from: ${CLIENT_URL}`);
  console.log('='.repeat(50));
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(50));
  if (NODE_ENV === 'development') {
    console.log('💡 Tip: Server will auto-restart on file changes (nodemon)');
  }
  console.log('');
});
