const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true
  },
  loanType: {
    type: String,
    required: true,
    lowercase: true
  },
  loanAmount: {
    min: Number,
    max: Number
  },
  interestRate: {
    min: Number,
    max: Number
  },
  tenure: {
    min: Number,
    max: Number
  },
  processingFee: String,
  isInstant: Boolean,
  isPaperless: Boolean,
  eligibilityCriteria: [String],
  requiredDocuments: [String],
  benefits: [String],
  specialFeatures: [String],
  sourceUrl: String,
  originalDataId: mongoose.Schema.Types.ObjectId,
}, {
  timestamps: true
});

const BankModel = mongoose.model('Bank', bankSchema);

module.exports = BankModel; 