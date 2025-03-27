import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoanCard = ({ loan }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handleApplyNow = () => {
    // Navigate to loan details page with the loan data
    navigate(`/loan/${loan._id}`, { state: { loan } });
  };

  // Format interest rate for display
  const formatInterestRate = (rate) => {
    if (typeof rate === 'object') {
      if (rate.min === rate.max) {
        return `${rate.min}%`;
      }
      return `${rate.min}% - ${rate.max}%`;
    }
    return rate;
  };

  return (
    <div className={`loan-card ${expanded ? 'expanded' : ''}`}>
      <div className="loan-card-header">
        <h3>{loan.bankName}</h3>
        <div className="loan-type">{loan.loanType}</div>
      </div>
      
      <div className="loan-card-body">
        <div className="loan-detail">
          <span className="label">Interest Rate:</span>
          <span className="value">{formatInterestRate(loan.interestRate)}</span>
        </div>
        
        <div className="loan-detail">
          <span className="label">Loan Amount:</span>
          <span className="value">₹{loan.loanAmountRange.min.toLocaleString()} - ₹{loan.loanAmountRange.max.toLocaleString()}</span>
        </div>
        
        <div className="loan-detail">
          <span className="label">Tenure:</span>
          <span className="value">{loan.tenureRange.min} - {loan.tenureRange.max} months</span>
        </div>
        
        <div className="loan-detail">
          <span className="label">Processing Fee:</span>
          <span className="value">{loan.processingFee}</span>
        </div>
        
        {expanded && (
          <div className="loan-details-expanded">
            {loan.eligibilityCriteria.length > 0 && (
              <div className="loan-detail-section">
                <h4>Eligibility Criteria</h4>
                <ul>
                  {loan.eligibilityCriteria.map((criteria, index) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {loan.requiredDocuments.length > 0 && (
              <div className="loan-detail-section">
                <h4>Required Documents</h4>
                <ul>
                  {loan.requiredDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {loan.benefits.length > 0 && (
              <div className="loan-detail-section">
                <h4>Benefits</h4>
                <ul>
                  {loan.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {loan.specialFeatures.length > 0 && (
              <div className="loan-detail-section">
                <h4>Special Features</h4>
                <ul>
                  {loan.specialFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="loan-card-footer">
        <button className="expand-button" onClick={toggleExpand}>
          {expanded ? 'Show Less' : 'Show More'}
        </button>
        
        <button 
          className="apply-button" 
          onClick={handleApplyNow}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default LoanCard; 