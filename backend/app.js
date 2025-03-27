const express = require('express');
const cors = require('cors');
const bankRoutes = require('./routes/bankRoutes');
const loanRoutes = require('./routes/loanRoutes');
const userRoutes = require('./routes/userRoutes');
const cronJobs = require('./utils/cronJobs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/banks', bankRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);

// Initialize cron jobs
cronJobs.initCronJobs();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app; 