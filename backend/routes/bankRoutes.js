const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const BankModel = require('../models/BankModel');

// Debug middleware
router.use((req, res, next) => {
    console.log(`Bank route accessed: ${req.method} ${req.path}`);
    next();
});

// GET loans by type
router.get('/type/:loanType', async (req, res) => {
    try {
        console.log(`Fetching loans for type: ${req.params.loanType}`);
        const loans = await BankModel.find({ 
            loanType: req.params.loanType.toLowerCase() 
        });
        console.log(`Found ${loans.length} loans`);
        res.json({
            success: true,
            data: loans
        });
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch loans'
        });
    }
});

// GET all banks
router.get('/', bankController.getAllBanks);

// GET bank by ID - Move this AFTER the /type route
router.get('/:id', bankController.getBankById);

// POST trigger all scrapers
router.post('/trigger-all-scrapers', bankController.triggerAllScrapers);

// POST trigger specific scraper
router.post('/trigger-scraper/:loanType', async (req, res) => {
    try {
        const { loanType } = req.params;
        console.log(`Triggering scraper for: ${loanType}`);
        
        // Add sample data for testing
        const sampleLoan = new BankModel({
            bankName: "Sample Bank",
            loanType: loanType.toLowerCase(),
            loanAmount: {
                min: 100000,
                max: 5000000
            },
            interestRate: {
                min: 8.5,
                max: 12.5
            },
            tenure: {
                min: 1,
                max: 5
            },
            processingFee: "1%",
            isInstant: true,
            isPaperless: true
        });

        await sampleLoan.save();
        
        res.json({
            success: true,
            message: `Scraper triggered for ${loanType}`
        });
    } catch (error) {
        console.error('Error triggering scraper:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to trigger scraper'
        });
    }
});

// Test route
router.post('/test', (req, res) => {
    console.log('Test route hit');
    res.json({
        success: true,
        message: 'Test route working'
    });
});

module.exports = router; 