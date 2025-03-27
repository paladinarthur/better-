const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankModel',
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    loanType: {
      type: String,
      required: true,
    },
    interestRate: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    requestedAmount: {
      type: Number,
      required: true,
    },
    requestedTenure: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'under_review'],
      default: 'pending',
    },
    aiAdvice: {
      type: String,
      default: '',
    },
    applicationNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient user lookup
applicationSchema.index({ userId: 1 });
applicationSchema.index({ status: 1 });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application; 