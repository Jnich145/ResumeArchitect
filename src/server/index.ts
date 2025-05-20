import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Use port 3001 to match frontend expectations

// Security headers
app.use(helmet());

// CORS setup with credentials support
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || 'https://resumearchitect.com' 
    : ['http://localhost:5173', 'http://localhost:5174'], // Support both potential ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Body parsing middleware
app.use(express.json({ limit: '2mb' })); // Increased limit for resume data with images
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Rate limiting for sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // Increased limit in development
  standardHeaders: true,
  message: 'Too many authentication attempts, please try again after 15 minutes'
});

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 300, // Increased limit in development
  standardHeaders: true,
  message: 'Too many requests from this IP, please try again after 5 minutes'
});

// Apply rate limiters to specific paths
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('Resume Architect API is running');
});

// API version endpoint for quick checking
app.get('/version', (_req: Request, res: Response) => {
  res.json({
    name: 'resume-architect-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message 
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // In production, you might want to exit and let a process manager restart the app
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
