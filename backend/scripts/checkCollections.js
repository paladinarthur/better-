const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
console.log('Looking for .env file at:', envPath);
require('dotenv').config({ path: envPath });

const RawLoanData = require('../models/RawLoanData');
const BankModel = require('../models/BankModel');

const checkCollections = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('Current directory:', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Check RawLoanData collection
    console.log('\nChecking RawLoanData collection:');
    const rawDataCount = await RawLoanData.countDocuments();
    console.log(`Total documents in RawLoanData: ${rawDataCount}`);
    
    if (rawDataCount > 0) {
      const sampleRawData = await RawLoanData.findOne();
      console.log('Sample RawLoanData document:', JSON.stringify(sampleRawData, null, 2));
    }
    
    // Check BankModel collection
    console.log('\nChecking BankModel collection:');
    const bankModelCount = await BankModel.countDocuments();
    console.log(`Total documents in BankModel: ${bankModelCount}`);
    
    if (bankModelCount > 0) {
      const sampleBankModel = await BankModel.findOne();
      console.log('Sample BankModel document:', JSON.stringify(sampleBankModel, null, 2));
    }
    
    // Check documents by loan type
    const loanTypes = ['Home Loan', 'Education Loan', 'Personal Loan', 'Car Loan'];
    console.log('\nDocuments by loan type:');
    for (const loanType of loanTypes) {
      const count = await RawLoanData.countDocuments({ loanType });
      console.log(`${loanType}: ${count} documents`);
    }
    
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    
  } catch (error) {
    console.error('Error checking collections:', error);
  }
};

checkCollections(); 