const scraperService = require('../services/scraperService');

const testScrapers = async () => {
  try {
    console.log('Testing all scrapers...');
    
    // Run all scrapers
    const results = await scraperService.runAllScrapers(true);
    
    console.log('Scraper test results:');
    console.log(`Home Loans: ${results.homeLoan?.length || 0} items`);
    console.log(`Education Loans: ${results.educationLoan?.length || 0} items`);
    console.log(`Personal Loans: ${results.personalLoan?.length || 0} items`);
    console.log(`Car Loans: ${results.carLoan?.length || 0} items`);
    
  } catch (error) {
    console.error('Error testing scrapers:', error);
  }
};

testScrapers(); 