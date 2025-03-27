const mongoose = require('mongoose');
const BankModel = require('../models/BankModel');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Hardcode the connection string for now to ensure it works
const MONGO_URI = 'mongodb+srv://saransankar885:Saran885@cluster0.4glxw.mongodb.net/loan-comparison?retryWrites=true&w=majority';

const seedData = [
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
    requiredDocuments: ['ID Proof', 'Address Proof', 'Income Proof'],
    benefits: ['Quick approval', 'No hidden charges'],
    specialFeatures: ['Online application', 'Doorstep service'],
    sourceUrl: 'https://example.com',
  },
  {
    bankName: 'Test Bank 2',
    loanType: 'Personal Loan',
    interestRate: 10.5,
    minTenure: 12,
    maxTenure: 60,
    minLoanAmount: 100000,
    maxLoanAmount: 1500000,
    processingFee: '2% of loan amount',
    eligibilityCriteria: ['Age 21-58', 'Minimum income of ₹30,000 per month'],
    requiredDocuments: ['ID Proof', 'Address Proof', 'Income Proof', 'Bank Statements'],
    benefits: ['Instant approval', 'Flexible repayment options'],
    specialFeatures: ['Zero prepayment charges', 'Top-up loan facility'],
    sourceUrl: 'https://example.com',
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    // Use the hardcoded connection string instead of process.env.MONGO_URI
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await BankModel.deleteMany({});
    console.log('Cleared existing bank data');
    
    // Insert new data
    const result = await BankModel.insertMany(seedData);
    console.log(`Added ${result.length} banks to the database`);
    
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 