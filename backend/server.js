const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const cron = require('node-cron');
const bankRoutes = require('./routes/bankRoutes');
const userRoutes = require('./routes/userRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const scraperService = require('./services/scraperService');
const BankModel = require('./models/BankModel');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/banks', bankRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);

// Schedule all scrapers to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled scraper jobs');
  try {
    // Run all scrapers with OpenAI processing skipped
    await scraperService.runAllScrapers(true);
    console.log('All scraper jobs completed successfully');
  } catch (error) {
    console.error('Scraper jobs failed:', error);
  }
});

// Basic route
app.get('/', (req, res) => {
  res.send('Loan Comparison API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route is working' });
});

exports.getAllBanks = async (req, res) => {
  console.log('getAllBanks controller function called');
  try {
    console.log('Attempting to find banks in database');
    const banks = await BankModel.find();
    console.log(`Found ${banks.length} banks:`, JSON.stringify(banks, null, 2));
    res.status(200).json({ success: true, data: banks });
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banks' });
  }
};