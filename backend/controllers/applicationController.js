const Application = require('../models/Application');
const openaiService = require('../services/openaiService');

// Submit a loan application
exports.submitApplication = async (req, res) => {
  try {
    const { 
      userId, 
      loanId, 
      bankName, 
      loanType, 
      interestRate, 
      requestedAmount, 
      requestedTenure 
    } = req.body;
    
    if (!userId || !loanId || !bankName || !loanType || !requestedAmount || !requestedTenure) {
      return res.status(400).json({ 
        success: false,
        message: 'Required fields missing' 
      });
    }
    
    // Create new application
    const application = new Application({
      userId,
      loanId,
      bankName,
      loanType,
      interestRate,
      requestedAmount,
      requestedTenure,
      status: 'pending'
    });
    
    const savedApplication = await application.save();
    
    // Generate AI-powered application advice
    const applicationAdvice = await openaiService.generateApplicationAdvice(savedApplication);
    
    // Update application with AI advice
    savedApplication.aiAdvice = applicationAdvice;
    await savedApplication.save();
    
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: savedApplication,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit application', 
      error: error.message 
    });
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: 'User ID is required' 
      });
    }
    
    const applications = await Application.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch applications', 
      error: error.message 
    });
  }
}; 