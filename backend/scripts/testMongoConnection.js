const mongoose = require('mongoose');
require('dotenv').config();

const testMongoConnection = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
  }
};

testMongoConnection(); 