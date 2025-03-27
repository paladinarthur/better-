const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_URL = 'http://localhost:5000/api';

const testScrapers = async () => {
  try {
    console.log('Testing Scrapers and API Integration...\n');

    // 1. Check if JSON files exist
    console.log('Checking for JSON files...');
    const utilsDir = path.join(__dirname, '../../utils');
    const files = await fs.readdir(utilsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    console.log('Found JSON files:', jsonFiles, '\n');

    // 2. Trigger all scrapers
    console.log('Triggering all scrapers...');
    const scrapeResponse = await axios.post(`${API_URL}/banks/trigger-all-scrapers`);
    console.log('Scraper Response:', scrapeResponse.data, '\n');

    // 3. Wait a bit for processing
    console.log('Waiting for processing...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Check data for each loan type
    const loanTypes = ['homeLoan', 'educationLoan', 'personalLoan', 'carLoan'];
    
    for (const loanType of loanTypes) {
      console.log(`\nChecking ${loanType} data...`);
      const response = await axios.get(`${API_URL}/banks/type/${loanType}`);
      console.log(`${loanType} count:`, response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('Sample data:', response.data.data[0]);
      }
    }

  } catch (error) {
    console.error('Error during testing:', error.message);
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
  }
};

testScrapers(); 