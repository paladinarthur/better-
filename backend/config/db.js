const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '../.env');
console.log('Looking for .env file at:', envPath);
dotenv.config({ path: envPath });

// Verify MONGO_URI is loaded
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Environment variables not loaded properly');
  console.error('Current working directory:', process.cwd());
  console.error('__dirname:', __dirname);
  throw new Error('MONGO_URI environment variable is not defined');
}

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
};

// Track connection status
let isConnected = false;

// Function to connect to MongoDB
const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, options);
    isConnected = true;
    console.log('MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
      isConnected = false;
      setTimeout(connectDB, 5000);
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    setTimeout(connectDB, 5000);
    throw error;
  }
};

module.exports = connectDB; 