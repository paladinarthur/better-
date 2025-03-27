const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const connectDB = require('../config/db');
const RawLoanData = require('../models/RawLoanData');
const openaiService = require('./openaiService');
const BankModel = require('../models/BankModel');
const dataProcessingService = require('./dataProcessingService');

// Paths to the output JSON files from the Python scrapers
const SCRAPER_OUTPUT_PATHS = {
  homeLoan: path.join(__dirname, '../../utils/scraped_data.json'),
  educationLoan: path.join(__dirname, '../../utils/education_loan_data.json'),
  personalLoan: path.join(__dirname, '../../utils/loans_data.json'),
  carLoan: path.join(__dirname, '../../utils/car_loan_data.json')
};

/**
 * Run a Python scraper and store the results
 * @param {string} scraperType - Type of loan scraper to run
 * @returns {Promise<Object>} - Results of the scraper operation
 */
const runScraper = async (scraperType = 'homeLoan') => {
  let scriptPath;
  
  switch (scraperType) {
    case 'educationLoan':
      scriptPath = path.join(__dirname, '../../utils/edu.py');
      break;
    case 'personalLoan':
      scriptPath = path.join(__dirname, '../../utils/bankbaazarpersonaloans.py');
      break;
    case 'carLoan':
      scriptPath = path.join(__dirname, '../../utils/carloan.py');
      break;
    case 'homeLoan':
    default:
      scriptPath = path.join(__dirname, '../../utils/homeloanscraper.py');
      break;
  }

  return new Promise((resolve, reject) => {
    console.log(`Starting Python scraper for ${scraperType}...`);
    
    const pythonProcess = spawn('python', [scriptPath]);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`${scraperType} scraper output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`${scraperType} scraper error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`${scraperType} scraper completed successfully`);
        resolve();
      } else {
        reject(new Error(`${scraperType} scraper process exited with code ${code}`));
      }
    });
  });
};

// Transform scraped data into the format expected by RawLoanData model
const transformScrapedData = (scrapedData) => {
  console.log('Transforming scraped data...');
  
  // Create sample data since the scraped format doesn't match our schema
  const transformedData = [
    {
      bankName: 'HDFC Bank',
      loanType: 'Home Loan',
      interestRate: 8.5,
      minTenure: 12,
      maxTenure: 360,
      minLoanAmount: 500000,
      maxLoanAmount: 10000000,
      processingFee: '1% of loan amount',
      eligibilityCriteria: ['Age 21-65', 'Minimum income of ₹25,000 per month'],
      documents: ['ID Proof', 'Address Proof', 'Income Proof'],
      sourceUrl: 'https://www.bankbazaar.com/home-loan.html'
    },
    {
      bankName: 'SBI',
      loanType: 'Home Loan',
      interestRate: 8.75,
      minTenure: 12,
      maxTenure: 360,
      minLoanAmount: 500000,
      maxLoanAmount: 15000000,
      processingFee: '0.5% of loan amount',
      eligibilityCriteria: ['Age 21-70', 'Minimum income of ₹20,000 per month'],
      documents: ['ID Proof', 'Address Proof', 'Income Proof', 'Property Documents'],
      sourceUrl: 'https://www.bankbazaar.com/home-loan.html'
    }
  ];
  
  console.log(`Transformed ${transformedData.length} items`);
  return transformedData;
};

/**
 * Process the scraped data for a specific loan type
 * @param {string} loanType - Type of loan to process
 * @returns {Promise<Array>} - Array of processed raw data items
 */
const processScraper = async (skipOpenAI = true, loanType = 'homeLoan') => {
  try {
    // Ensure MongoDB is connected before proceeding
    await connectDB();
    console.log(`Connected to MongoDB for ${loanType} processing`);
    
    // Run the scraper
    await runScraper(loanType);
    console.log(`Completed running ${loanType} scraper`);
    
    // Get the appropriate output path
    const outputPath = SCRAPER_OUTPUT_PATHS[loanType];
    console.log(`Looking for scraped data at: ${outputPath}`);
    
    // Check if the file exists
    try {
      await fs.access(outputPath);
      console.log(`Found scraped data file at: ${outputPath}`);
    } catch (error) {
      console.error(`Scraped data file not found at: ${outputPath}`);
      throw new Error(`Scraped data file for ${loanType} not found`);
    }
    
    // Read the output JSON file
    const rawData = await fs.readFile(outputPath, 'utf8');
    const scrapedData = JSON.parse(rawData);
    console.log(`Read ${loanType} data:`, {
      dataKeys: Object.keys(scrapedData),
      dataLength: Array.isArray(scrapedData) ? scrapedData.length : 'not an array'
    });
    
    // Transform the data
    const transformedData = await dataProcessingService.processScrapedData(scrapedData, loanType);
    console.log(`Transformed ${transformedData.length} items for ${loanType}`);
    
    // Store in MongoDB
    const savedRawData = await RawLoanData.insertMany(transformedData, { timeout: 60000 });
    console.log(`Successfully stored ${savedRawData.length} ${loanType} items in MongoDB`);
    
    return savedRawData;
  } catch (error) {
    console.error(`Error in processScraper for ${loanType}:`, error);
    return [];
  }
};

/**
 * Run all scrapers and process their data
 */
const runAllScrapers = async (skipOpenAI = true) => {
  const results = {};
  
  try {
    // Process home loans
    console.log('Processing home loans...');
    results.homeLoan = await processScraper(skipOpenAI, 'homeLoan');
    
    // Process education loans
    console.log('Processing education loans...');
    results.educationLoan = await processScraper(skipOpenAI, 'educationLoan');
    
    // Process personal loans
    console.log('Processing personal loans...');
    results.personalLoan = await processScraper(skipOpenAI, 'personalLoan');
    
    // Process car loans
    console.log('Processing car loans...');
    results.carLoan = await processScraper(skipOpenAI, 'carLoan');
    
    return results;
  } catch (error) {
    console.error('Error running all scrapers:', error);
    return results;
  }
};

module.exports = {
  runScraper,
  processScraper,
  runAllScrapers
}; 