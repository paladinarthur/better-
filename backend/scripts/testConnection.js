const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string: ${process.env.MONGO_URI}`);
    
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Successfully connected to MongoDB!');
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Disconnect after test
    await mongoose.disconnect();
    console.log('Test complete, disconnected from MongoDB');
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
};

testConnection(); 