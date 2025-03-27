const scraperService = require('../services/scraperService');

const testScraper = async () => {
  try {
    console.log('Testing scraper integration...');
    
    // Run the scraper process with OpenAI processing skipped
    const result = await scraperService.processScraper(true);
    
    console.log('Scraper test completed successfully!');
    console.log(`Processed ${result.length} items`);
    
  } catch (error) {
    console.error('Scraper test failed:', error);
  }
};

testScraper(); 