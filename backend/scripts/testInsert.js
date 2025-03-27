const mongoose = require('mongoose');
const RawLoanData = require('../models/RawLoanData');
const connectDB = require('../config/db');

async function testInsert() {
  try {
    console.log('Testing MongoDB insert operation...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Sample data
    const sampleData = [
      {
        bankName: 'Test Bank 1',
        loanType: 'Home Loan',
        interestRate: 8.5,
        minTenure: 12,
        maxTenure: 360,
        minLoanAmount: 500000,
        maxLoanAmount: 10000000,
        processingFee: '1% of loan amount',
        eligibilityCriteria: ['Age 21-65', 'Minimum income of ₹25,000 per month'],
        documents: ['ID Proof', 'Address Proof', 'Income Proof'],
        sourceUrl: 'https://example.com'
      }
    ];
    
    console.log('Attempting to insert data...');
    const result = await RawLoanData.insertMany(sampleData);
    console.log(`Successfully inserted ${result.length} documents`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

testInsert(); 