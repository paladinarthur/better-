const BankModel = require('../models/BankModel');
const RawLoanData = require('../models/RawLoanData');
const UserPreference = require('../models/UserPreference');
const openaiService = require('../services/openaiService');
const scraperService = require('../services/scraperService');
const cacheService = require('../services/cacheService');
const mongoose = require('mongoose');

// Get all banks with caching
exports.getAllBanks = async (req, res) => {
  try {
    // Check cache first
    const cachedBanks = cacheService.get('all_banks');
    if (cachedBanks) {
      console.log('Returning banks from cache');
      return res.status(200).json({ success: true, data: cachedBanks });
    }
    
    // If not in cache, get from database
    console.log('Fetching banks from database');
    const banks = await BankModel.find();
    
    // Store in cache
    cacheService.set('all_banks', banks);
    
    res.status(200).json({ success: true, data: banks });
  } catch (error) {
    console.error('Error fetching banks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banks' });
  }
};

// Get bank by ID
exports.getBankById = async (req, res) => {
  try {
    const bank = await BankModel.findById(req.params.id);
    if (!bank) {
      return res.status(404).json({
        success: false,
        message: 'Bank not found'
      });
    }
    res.status(200).json({
      success: true,
      data: bank
    });
  } catch (error) {
    console.error('Error fetching bank:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank',
      error: error.message
    });
  }
};

// Store raw scraped data
exports.storeScrapedData = async (req, res) => {
  try {
    const scrapedData = req.body;
    
    if (!Array.isArray(scrapedData)) {
      return res.status(400).json({ message: 'Expected an array of loan data' });
    }
    
    const savedData = await RawLoanData.insertMany(scrapedData);
    
    res.status(201).json({
      message: `Successfully stored ${savedData.length} loan data entries`,
      data: savedData,
    });
  } catch (error) {
    console.error('Error storing scraped data:', error);
    res.status(500).json({ message: 'Failed to store scraped data', error: error.message });
  }
};

// Generate bank models from raw data
exports.generateBankModels = async (req, res) => {
  try {
    // Get raw data that hasn't been processed yet
    const rawData = await RawLoanData.find({ processed: false });
    
    if (rawData.length === 0) {
      return res.status(200).json({ message: 'No new raw data to process' });
    }
    
    const results = [];
    
    // Process each raw data item
    for (const item of rawData) {
      try {
        // Generate structured data using OpenAI
        const enhancedData = await openaiService.generateBankModel(item);
        
        // Store the structured data
        const bankModel = new BankModel({
          ...enhancedData,
          originalDataId: item._id
        });
        
        await bankModel.save();
        
        // Mark raw data as processed
        item.processed = true;
        await item.save();
        
        results.push({
          rawDataId: item._id,
          bankModelId: bankModel._id,
          success: true
        });
      } catch (error) {
        console.error(`Error processing item ${item._id}:`, error);
        results.push({
          rawDataId: item._id,
          success: false,
          error: error.message
        });
      }
    }
    
    res.status(200).json({
      message: `Processed ${results.length} raw data items`,
      results
    });
  } catch (error) {
    console.error('Error generating bank models:', error);
    res.status(500).json({ message: 'Failed to generate bank models', error: error.message });
  }
};

// Filter loans based on user preferences
exports.filterLoans = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user preferences
    const userPreference = await UserPreference.findOne({ userId });
    
    if (!userPreference) {
      return res.status(404).json({
        success: false,
        message: 'User preferences not found'
      });
    }
    
    // Build filter query based on user preferences
    const filterQuery = {
      loanType: userPreference.loanType
    };
    
    if (userPreference.maxInterestRate) {
      filterQuery.interestRate = { $lte: userPreference.maxInterestRate };
    }
    
    if (userPreference.minLoanAmount && userPreference.maxLoanAmount) {
      filterQuery.minLoanAmount = { $lte: userPreference.maxLoanAmount };
      filterQuery.maxLoanAmount = { $gte: userPreference.minLoanAmount };
    }
    
    // Find matching loans
    const loans = await BankModel.find(filterQuery);
    
    res.status(200).json({
      success: true,
      count: loans.length,
      data: loans
    });
  } catch (error) {
    console.error('Error filtering loans:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering loans',
      error: error.message
    });
  }
};

// Get loans by type
exports.getLoansByType = async (req, res) => {
  try {
    const { loanType } = req.params;
    console.log(`Fetching ${loanType} loans from database`);
    
    // Check cache first
    const cacheKey = `loans_${loanType}`;
    const cachedLoans = cacheService.get(cacheKey);
    if (cachedLoans) {
      console.log(`Returning ${loanType} loans from cache`);
      return res.status(200).json({ success: true, data: cachedLoans });
    }
    
    // Convert loanType to proper format for database query
    const formattedLoanType = loanType
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^./, str => str.toUpperCase());
    
    console.log(`Searching for loan type: ${formattedLoanType}`);
    
    // Get from database
    const loans = await BankModel.find({ loanType: formattedLoanType });
    console.log(`Found ${loans.length} loans of type ${formattedLoanType}`);
    
    // Store in cache
    cacheService.set(cacheKey, loans);
    
    res.status(200).json({ success: true, data: loans });
  } catch (error) {
    console.error(`Error fetching ${req.params.loanType} loans:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to fetch ${req.params.loanType} loans`,
      error: error.message 
    });
  }
};

// Trigger specific scraper
exports.triggerSpecificScraper = async (req, res) => {
  try {
    const { loanType } = req.params;
    console.log(`Manually triggering ${loanType} scraper`);
    
    // Start the scraper process
    const result = await scraperService.processScraper(true, loanType);
    
    // Clear cache for this loan type
    cacheService.del(`loans_${loanType}`);
    cacheService.del('all_banks');
    
    res.status(200).json({
      success: true,
      message: `${loanType} scraper process completed successfully`,
      data: {
        itemsProcessed: result.length
      }
    });
  } catch (error) {
    console.error(`Error triggering ${loanType} scraper:`, error);
    res.status(500).json({
      success: false,
      message: `Error triggering ${loanType} scraper`,
      error: error.message
    });
  }
};

// Trigger all scrapers
exports.triggerAllScrapers = async (req, res) => {
  try {
    console.log('Triggering all scrapers');
    
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
    await BankModel.insertMany(sampleLoans);

    res.json({
      success: true,
      message: 'All scrapers triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering all scrapers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger scrapers'
    });
  }
};

// Get personalized bank recommendations
exports.getPersonalizedBanks = async (req, res) => {
  try {
    const { income, loanAmount, tenure, employmentType } = req.query;
    
    // Get all banks
    let banks = await BankModel.find();
    
    // Apply filters based on user preferences
    if (loanAmount) {
      const amount = parseFloat(loanAmount);
      banks = banks.filter(bank => 
        bank.minLoanAmount <= amount && bank.maxLoanAmount >= amount
      );
    }
    
    if (tenure) {
      const months = parseInt(tenure);
      banks = banks.filter(bank => 
        bank.minTenure <= months && bank.maxTenure >= months
      );
    }
    
    // Sort by interest rate (lowest first)
    banks.sort((a, b) => {
      if (typeof a.interestRate === 'number' && typeof b.interestRate === 'number') {
        return a.interestRate - b.interestRate;
      }
      return 0;
    });
    
    // Calculate EMI and total payment for each bank
    if (loanAmount && tenure) {
      const amount = parseFloat(loanAmount);
      const months = parseInt(tenure);
      
      banks = banks.map(bank => {
        const rate = typeof bank.interestRate === 'number' ? bank.interestRate : 8.5;
        const monthlyRate = rate / 12 / 100;
        const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                   (Math.pow(1 + monthlyRate, months) - 1);
        
        return {
          ...bank.toObject(),
          calculatedEMI: Math.round(emi),
          totalPayment: Math.round(emi * months),
          totalInterest: Math.round(emi * months - amount)
        };
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: banks,
      message: 'Personalized recommendations based on your criteria'
    });
  } catch (error) {
    console.error('Error fetching personalized banks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch personalized recommendations' });
  }
};

// Add this to the top of your controller
exports.testConnection = async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.json({
            success: true,
            message: 'Database connection is working'
        });
    } catch (error) {
        console.error('Database connection test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Database connection failed'
        });
    }
}; 