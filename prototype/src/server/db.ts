import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

// MongoDB connection options
const mongooseOptions = {
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to connect for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Retry connection logic
let retryCount = 0;
const MAX_RETRIES = 5;

// Use mock database when MongoDB URI is missing
let useMockDB = false;

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.warn('⚠️ No MongoDB URI found. Using mock database for development.');
      useMockDB = true;
      // We're not actually connecting to a database, just mocking the connection
      console.log('Mock database ready for use.');
      return;
    }
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, mongooseOptions);
    console.log('MongoDB connected successfully');
    
    // Reset retry count on successful connection
    retryCount = 0;
    
    // Log connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      attemptReconnect();
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      attemptReconnect();
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', closeConnection);
    process.on('SIGTERM', closeConnection);
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Falling back to mock database for development.');
      useMockDB = true;
      // We're not actually connecting to a database, just mocking the connection
      console.log('Mock database ready for use.');
      return;
    }
    
    attemptReconnect();
  }
};

// Function to attempt reconnection
const attemptReconnect = () => {
  if (retryCount < MAX_RETRIES) {
    retryCount++;
    const retryDelayMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
    console.log(`Retrying connection in ${retryDelayMs / 1000} seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`);
    
    setTimeout(async () => {
      try {
        await connectDB();
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
      }
    }, retryDelayMs);
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Failed to connect to MongoDB. Using mock database for development.');
      useMockDB = true;
      return;
    }
    
    console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Exiting process.`);
    process.exit(1);
  }
};

// Function to close connection
const closeConnection = async () => {
  if (useMockDB) {
    console.log('Mock database connection closed');
    process.exit(0);
    return;
  }
  
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during MongoDB disconnection:', err);
    process.exit(1);
  }
};

// Export flag for other modules to check
export const isMockDB = () => useMockDB;
