import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserPreferencesForm = ({ initialValues, onSubmit }) => {
  const [loanTypes, setLoanTypes] = useState(['Home Loan', 'Personal Loan', 'Car Loan', 'Education Loan']);
  const [banks, setBanks] = useState([]);
  const [formValues, setFormValues] = useState({
    loanType: 'Home Loan',
    loanAmount: 1000000,
    tenure: 240, // 20 years in months
    preferredBanks: [],
    maxInterestRate: null,
    employmentType: '',
    annualIncome: null,
    creditScore: null
  });

  // Fetch available banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/banks`);
        if (response.data.success) {
          // Extract unique bank names
          const uniqueBanks = [...new Set(response.data.data.map(bank => bank.bankName))];
          setBanks(uniqueBanks);
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };

    fetchBanks();
  }, []);

  // Update form values when initialValues change
  useEffect(() => {
    if (initialValues) {
      setFormValues(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle checkbox for preferred banks
      if (name === 'preferredBanks') {
        setFormValues(prev => {
          const updatedBanks = checked
            ? [...prev.preferredBanks, value]
            : prev.preferredBanks.filter(bank => bank !== value);
          
          return { ...prev, preferredBanks: updatedBanks };
        });
      }
    } else {
      // Handle other inputs
      setFormValues(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  return (
    <div className="user-preferences-form">
      <h2>Your Loan Preferences</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="loanType">Loan Type</label>
          <select 
            id="loanType" 
            name="loanType" 
            value={formValues.loanType} 
            onChange={handleChange}
            required
          >
            {loanTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="loanAmount">Loan Amount (₹)</label>
          <input 
            type="number" 
            id="loanAmount" 
            name="loanAmount" 
            min="10000" 
            max="100000000" 
            value={formValues.loanAmount} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tenure">Loan Tenure (months)</label>
          <input 
            type="number" 
            id="tenure" 
            name="tenure" 
            min="12" 
            max="360" 
            value={formValues.tenure} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="maxInterestRate">Maximum Interest Rate (%)</label>
          <input 
            type="number" 
            id="maxInterestRate" 
            name="maxInterestRate" 
            min="1" 
            max="30" 
            step="0.1" 
            value={formValues.maxInterestRate || ''} 
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="employmentType">Employment Type</label>
          <select 
            id="employmentType" 
            name="employmentType" 
            value={formValues.employmentType || ''} 
            onChange={handleChange}
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
            min="0" 
            value={formValues.annualIncome || ''} 
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="creditScore">Credit Score</label>
          <input 
            type="number" 
            id="creditScore" 
            name="creditScore" 
            min="300" 
            max="900" 
            value={formValues.creditScore || ''} 
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label>Preferred Banks</label>
          <div className="checkbox-group">
            {banks.map(bank => (
              <div key={bank} className="checkbox-item">
                <input 
                  type="checkbox" 
                  id={`bank-${bank}`} 
                  name="preferredBanks" 
                  value={bank} 
                  checked={formValues.preferredBanks?.includes(bank) || false} 
                  onChange={handleChange}
                />
                <label htmlFor={`bank-${bank}`}>{bank}</label>
              </div>
            ))}
          </div>
        </div>
        
        <button type="submit" className="submit-button">Find Matching Loans</button>
      </form>
    </div>
  );
};

export default UserPreferencesForm; 