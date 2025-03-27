const mongoose = require('mongoose');
require('dotenv').config();
const RawLoanData = require('../models/RawLoanData');
const BankModel = require('../models/BankModel');

const checkCollections = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
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