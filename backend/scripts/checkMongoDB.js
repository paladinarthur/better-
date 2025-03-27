const mongoose = require('mongoose');
require('dotenv').config();

const RawLoanData = require('../models/RawLoanData');

const checkMongoDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');
    
    // Count documents by loan type
    const homeLoanCount = await RawLoanData.countDocuments({ loanType: 'Home Loan' });
    const educationLoanCount = await RawLoanData.countDocuments({ loanType: 'Education Loan' });
    const personalLoanCount = await RawLoanData.countDocuments({ loanType: 'Personal Loan' });
    const carLoanCount = await RawLoanData.countDocuments({ loanType: 'Car Loan' });
    
    console.log('MongoDB Data Summary:');
    console.log(`Home Loans: ${homeLoanCount} documents`);
    console.log(`Education Loans: ${educationLoanCount} documents`);
    console.log(`Personal Loans: ${personalLoanCount} documents`);
    console.log(`Car Loans: ${carLoanCount} documents`);
    
    // Get a sample of each loan type
    console.log('\nSample Data:');
    
    const homeLoanSample = await RawLoanData.findOne({ loanType: 'Home Loan' });
    console.log('Home Loan Sample:', homeLoanSample ? JSON.stringify(homeLoanSample, null, 2) : 'No data');
    
    const educationLoanSample = await RawLoanData.findOne({ loanType: 'Education Loan' });
    console.log('Education Loan Sample:', educationLoanSample ? JSON.stringify(educationLoanSample, null, 2) : 'No data');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error checking MongoDB:', error);
  }
};

checkMongoDB(); 