import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LoanDetails = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loan, setLoan] = useState(location.state?.loan || null);
  const [loading, setLoading] = useState(!location.state?.loan);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState({
    requestedAmount: '',
    requestedTenure: '',
    employmentType: '',
    annualIncome: '',
    creditScore: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [applicationResult, setApplicationResult] = useState(null);
  const userId = localStorage.getItem('userId') || 'user_' + Date.now();

  // Fetch loan details if not provided in location state
  useEffect(() => {
    if (!loan && loanId) {
      const fetchLoanDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_BASE_URL}/banks/${loanId}`);
          if (response.data.success) {
            setLoan(response.data.data);
          } else {
            setError('Failed to fetch loan details');
          }
        } catch (error) {
          console.error('Error fetching loan details:', error);
          setError('Error loading loan details. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchLoanDetails();
    }
  }, [loanId, loan]);

  // Pre-fill application data based on loan details
  useEffect(() => {
    if (loan) {
      setApplicationData({
        ...applicationData,
        requestedAmount: loan.loanAmountRange?.min || '',
        requestedTenure: loan.tenureRange?.min || ''
      });
    }
  }, [loan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData({
      ...applicationData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setApplicationResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/applications`, {
        userId,
        loanId: loan._id,
        bankName: loan.bankName,
        loanType: loan.loanType,
        interestRate: loan.interestRate,
        requestedAmount: Number(applicationData.requestedAmount),
        requestedTenure: Number(applicationData.requestedTenure),
        employmentType: applicationData.employmentType,
        annualIncome: Number(applicationData.annualIncome),
        creditScore: Number(applicationData.creditScore)
      });

      if (response.data.success) {
        setApplicationResult({
          success: true,
          message: 'Application submitted successfully!',
          data: response.data.data
        });
        
        // Navigate to applications tab after successful submission
        setTimeout(() => {
          navigate('/applications');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading loan details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!loan) {
    return <div className="error">Loan not found. Please go back and try again.</div>;
  }

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
    <div className="loan-details-page">
      <button 
        className="back-button" 
        onClick={() => navigate(-1)}
      >
        &larr; Back to Loans
      </button>
      
      <div className="loan-details-container">
        <div className="loan-details-header">
          <h1>{loan.bankName} - {loan.loanType}</h1>
          <div className="loan-interest-rate">
            Interest Rate: {formatInterestRate(loan.interestRate)}
          </div>
        </div>
        
        <div className="loan-details-content">
          <div className="loan-info-section">
            <h2>Loan Information</h2>
            
            <div className="loan-info-grid">
              <div className="info-item">
                <span className="info-label">Loan Amount Range:</span>
                <span className="info-value">
                  ₹{loan.loanAmountRange.min.toLocaleString()} - ₹{loan.loanAmountRange.max.toLocaleString()}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Tenure Range:</span>
                <span className="info-value">
                  {loan.tenureRange.min} - {loan.tenureRange.max} months
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Processing Fee:</span>
                <span className="info-value">{loan.processingFee}</span>
              </div>
            </div>
            
            {loan.eligibilityCriteria.length > 0 && (
              <div className="loan-criteria-section">
                <h3>Eligibility Criteria</h3>
                <ul>
                  {loan.eligibilityCriteria.map((criteria, index) => (
                    <li key={index}>{criteria}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {loan.requiredDocuments.length > 0 && (
              <div className="loan-criteria-section">
                <h3>Required Documents</h3>
                <ul>
                  {loan.requiredDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {loan.benefits.length > 0 && (
              <div className="loan-criteria-section">
                <h3>Benefits</h3>
                <ul>
                  {loan.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {loan.specialFeatures.length > 0 && (
              <div className="loan-criteria-section">
                <h3>Special Features</h3>
                <ul>
                  {loan.specialFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="application-form-section">
            <h2>Apply for this Loan</h2>
            
            {applicationResult ? (
              <div className={`application-result ${applicationResult.success ? 'success' : 'error'}`}>
                <h3>{applicationResult.message}</h3>
                {applicationResult.success && (
                  <p>Redirecting to your applications...</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="application-form">
                <div className="form-group">
                  <label htmlFor="requestedAmount">Loan Amount (₹)</label>
                  <input 
                    type="number" 
                    id="requestedAmount" 
                    name="requestedAmount" 
                    value={applicationData.requestedAmount} 
                    onChange={handleChange}
                    min={loan.loanAmountRange.min}
                    max={loan.loanAmountRange.max}
                    required
                  />
                  <span className="input-hint">
                    Range: ₹{loan.loanAmountRange.min.toLocaleString()} - ₹{loan.loanAmountRange.max.toLocaleString()}
                  </span>
                </div>
                
                <div className="form-group">
                  <label htmlFor="requestedTenure">Loan Tenure (months)</label>
                  <input 
                    type="number" 
                    id="requestedTenure" 
                    name="requestedTenure" 
                    value={applicationData.requestedTenure} 
                    onChange={handleChange}
                    min={loan.tenureRange.min}
                    max={loan.tenureRange.max}
                    required
                  />
                  <span className="input-hint">
                    Range: {loan.tenureRange.min} - {loan.tenureRange.max} months
                  </span>
                </div>
                
                <div className="form-group">
                  <label htmlFor="employmentType">Employment Type</label>
                  <select 
                    id="employmentType" 
                    name="employmentType" 
                    value={applicationData.employmentType} 
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Employment Type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="business">Business Owner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="annualIncome">Annual Income (₹)</label>
                  <input 
                    type="number" 
                    id="annualIncome" 
                    name="annualIncome" 
                    value={applicationData.annualIncome} 
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="creditScore">Credit Score</label>
                  <input 
                    type="number" 
                    id="creditScore" 
                    name="creditScore" 
                    value={applicationData.creditScore} 
                    onChange={handleChange}
                    min="300"
                    max="900"
                    required
                  />
                  <span className="input-hint">
                    Range: 300 - 900
                  </span>
                </div>
                
                <button 
                  type="submit" 
                  className="submit-application-button"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails; 