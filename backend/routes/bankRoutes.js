const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');

// Add debug logging
router.use((req, res, next) => {
  console.log(`Bank route hit: ${req.method} ${req.originalUrl}`);
  next();
});

// GET all banks
router.get('/', (req, res, next) => {
  console.log('GET all banks route hit');
  bankController.getAllBanks(req, res, next);
});

// GET bank by ID
router.get('/:id', bankController.getBankById);

// POST store scraped data
router.post('/scrape-data', bankController.storeScrapedData);

// POST generate bank models from raw data
router.post('/generate-models', bankController.generateBankModels);

// GET filter loans based on user preferences
router.get('/filter/:userId', bankController.filterLoans);

// GET loans by type
router.get('/type/:loanType', bankController.getLoansByType);

// POST trigger specific scraper
router.post('/trigger-scraper/:loanType', bankController.triggerSpecificScraper);

// POST trigger all scrapers
router.post('/trigger-all-scrapers', bankController.triggerAllScrapers);

module.exports = router; 