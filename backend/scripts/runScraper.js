const scraperService = require('../services/scraperService');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    console.log('Starting scraper...');
    const result = await scraperService.runScraper();
    console.log('Scraper completed successfully:', result);
  } catch (error) {
    console.error('Scraper failed:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}); 