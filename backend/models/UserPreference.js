const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    loanType: {
      type: String,
      required: true,
    },
    loanAmount: {
      type: Number,
      required: true,
    },
    tenure: {
      type: Number,
      required: true,
    },
    preferredBanks: {
      type: [String],
      default: [],
    },
    maxInterestRate: {
      type: Number,
      default: null,
    },
    employmentType: {
      type: String,
      default: null,
    },
    annualIncome: {
      type: Number,
      default: null,
    },
    creditScore: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient user lookup
userPreferenceSchema.index({ userId: 1 });

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);

module.exports = UserPreference; 