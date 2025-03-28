const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bankRoutes = require('./routes/bankRoutes');
require('dotenv').config();

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('Loan Comparison API is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Define the runAllScrapers function
const runAllScrapers = async () => {
    try {
        console.log('Running all scrapers...');
        
        // Sample data for testing
        const sampleLoans = [
            {
                bankName: "HDFC Bank",
                loanType: "personal",
                loanAmount: { min: 100000, max: 4000000 },
                interestRate: { min: 10.85, max: 21.00 },
                tenure: { min: 1, max: 5 },
                processingFee: "₹4,999",
                isInstant: true,
                isPaperless: true
            },
            {
                bankName: "IndusInd Bank",
                loanType: "personal",
                loanAmount: { min: 100000, max: 500000 },
                interestRate: { min: 10.49, max: 10.49 },
                tenure: { min: 5, max: 5 },
                processingFee: "Up to 3.00%",
                isInstant: true,
                isPaperless: true
            }
        ];

        // Save sample data
        const BankModel = require('./models/BankModel');
        await BankModel.insertMany(sampleLoans);
        
        console.log('All scrapers completed successfully');
        return { success: true, message: 'All scrapers completed' };
    } catch (error) {
        console.error('Error running all scrapers:', error);
        throw error;
    }
};

// Direct route for triggering all scrapers
app.post('/api/banks/trigger-all-scrapers', async (req, res) => {
    try {
        console.log('Received request to trigger all scrapers');
        const result = await runAllScrapers();
        res.json({
            success: true,
            message: 'All scrapers triggered successfully',
            data: result
        });
    } catch (error) {
        console.error('Error triggering all scrapers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger scrapers'
        });
    }
});

// Mount bank routes
app.use('/api/banks', bankRoutes);

// Debug 404 handler
app.use((req, res, next) => {
    console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.originalUrl}`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Available routes:`);
            console.log(`- GET  /api/health`);
            console.log(`- GET  /api/banks/type/:loanType`);
            console.log(`- POST /api/banks/trigger-all-scrapers`);
            console.log(`- POST /api/banks/trigger-scraper/:loanType`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
    