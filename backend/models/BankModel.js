const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bankName: String,
  loanType: String,
  interestRate: Number,
  minTenure: Number,
  maxTenure: Number,
  minLoanAmount: Number,
  maxLoanAmount: Number,
  processingFee: String,
  eligibilityCriteria: [String],
  requiredDocuments: [String],
  benefits: [String],
  specialFeatures: [String],
  sourceUrl: String,
  originalDataId: mongoose.Schema.Types.ObjectId,
});

const BankModel = mongoose.model('BankModel', bankSchema);

module.exports = BankModel; 