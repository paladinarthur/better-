const mongoose = require('mongoose');

const rawLoanDataSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
    },
    loanType: {
      type: String,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    minTenure: {
      type: Number,
      required: true,
    },
    maxTenure: {
      type: Number,
      required: true,
    },
    minLoanAmount: {
      type: Number,
      required: true,
    },
    maxLoanAmount: {
      type: Number,
      required: true,
    },
    processingFee: {
      type: String,
      default: 'Not specified',
    },
    eligibilityCriteria: {
      type: [String],
      default: [],
    },
    documents: {
      type: [String],
      default: [],
    },
    sourceUrl: {
      type: String,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
rawLoanDataSchema.index({ bankName: 1, loanType: 1 });

const RawLoanData = mongoose.model('RawLoanData', rawLoanDataSchema);

module.exports = RawLoanData; 