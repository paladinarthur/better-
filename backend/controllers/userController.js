const UserPreference = require('../models/UserPreference');

// Get user preferences
exports.getUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }
    
    const userPreference = await UserPreference.findOne({ userId });
    
    if (!userPreference) {
      return res.status(404).json({ 
        success: false,
        message: 'User preferences not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: userPreference,
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user preferences', 
      error: error.message 
    });
  }
};

// Save user preferences
exports.saveUserPreferences = async (req, res) => {
  try {
    const { 
      userId, 
      loanType, 
      loanAmount, 
      tenure, 
      preferredBanks, 
      maxInterestRate, 
      employmentType, 
      annualIncome, 
      creditScore 
    } = req.body;
    
    if (!userId || !loanType || !loanAmount || !tenure) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing' 
      });
    }
    
    // Check if user preferences already exist
    const existingPreference = await UserPreference.findOne({ userId });
    
    if (existingPreference) {
      return res.status(400).json({ 
        success: false,
        message: 'User preferences already exist. Use PUT to update.' 
      });
    }
    
    // Create new user preferences
    const userPreference = new UserPreference({
      userId,
      loanType,
      loanAmount,
      tenure,
      preferredBanks,
      maxInterestRate,
      employmentType,
      annualIncome,
      creditScore,
    });
    
    const savedPreference = await userPreference.save();
    
    res.status(201).json({
      success: true,
      message: 'User preferences saved successfully',
      data: savedPreference,
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save user preferences', 
      error: error.message 
    });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }
    
    const userPreference = await UserPreference.findOne({ userId });
    
    if (!userPreference) {
      return res.status(404).json({ 
        success: false,
        message: 'User preferences not found' 
      });
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== 'userId' && key !== '_id') { // Prevent changing userId or _id
        userPreference[key] = updates[key];
      }
    });
    
    const updatedPreference = await userPreference.save();
    
    res.status(200).json({
      success: true,
      message: 'User preferences updated successfully',
      data: updatedPreference,
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user preferences', 
      error: error.message 
    });
  }
}; 