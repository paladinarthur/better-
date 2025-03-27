import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserPreferencesForm from './UserPreferencesForm';
import LoanList from './LoanList';
import LoanCard from './LoanCard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LoanComparison = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || 'user_' + Date.now());
  const [userPreferences, setUserPreferences] = useState(null);
  const [filters, setFilters] = useState({
    loanType: '',
    minAmount: '',
    maxAmount: '',
    maxInterestRate: ''
  });
  const [selectedBanks, setSelectedBanks] = useState([]);

  // Save userId to localStorage
  useEffect(() => {
    localStorage.setItem('userId', userId);
  }, [userId]);

  // Fetch user preferences if they exist
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/preferences/${userId}`);
        if (response.data.success) {
          setUserPreferences(response.data.data);
          // If preferences exist, fetch matching loans
          fetchMatchingLoans(response.data.data);
        }
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          setError('Failed to fetch user preferences');
          console.error('Error fetching user preferences:', error);
        }
      }
    };

    fetchUserPreferences();
  }, [userId]);

  // Fetch loans matching user preferences
  const fetchMatchingLoans = async (preferences) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/banks/filter/${userId}`);
      setLoans(response.data.data);
    } catch (error) {
      setError('Failed to fetch matching loans');
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handlePreferencesSubmit = async (preferences) => {
    setLoading(true);
    setError(null);
    
    try {
      // If user already has preferences, update them
      if (userPreferences) {
        await axios.put(`${API_BASE_URL}/users/preferences/${userId}`, {
          ...preferences,
          userId
        });
      } else {
        // Otherwise create new preferences
        await axios.post(`${API_BASE_URL}/users/preferences`, {
          ...preferences,
          userId
        });
      }
      
      // Update local state
      setUserPreferences({
        ...preferences,
        userId
      });
      
      // Fetch matching loans
      fetchMatchingLoans({
        ...preferences,
        userId
      });
    } catch (error) {
      setError('Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all loans on component mount
  useEffect(() => {
    fetchLoans();
  }, []);

  // Fetch loans from the API
  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/banks`);
      
      if (response.data.success) {
        setLoans(response.data.data);
      } else {
        setError('Failed to fetch loan data');
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      setError('Error loading loan data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Apply filters
  const applyFilters = () => {
    return loans.filter(loan => {
      // Filter by loan type if specified
      if (filters.loanType && loan.loanType !== filters.loanType) {
        return false;
      }
      
      // Filter by loan amount if specified
      if (filters.minAmount && loan.maxLoanAmount < parseInt(filters.minAmount)) {
        return false;
      }
      
      if (filters.maxAmount && loan.minLoanAmount > parseInt(filters.maxAmount)) {
        return false;
      }
      
      // Filter by interest rate if specified
      if (filters.maxInterestRate) {
        const maxRate = parseFloat(filters.maxInterestRate);
        if (typeof loan.interestRate === 'object') {
          if (loan.interestRate.min > maxRate) {
            return false;
          }
        } else if (loan.interestRate > maxRate) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Get filtered loans
  const filteredLoans = applyFilters();

  // Get unique loan types for the dropdown
  const loanTypes = [...new Set(loans.map(loan => loan.loanType))];

  const toggleBankSelection = (bankId) => {
    if (selectedBanks.includes(bankId)) {
      setSelectedBanks(selectedBanks.filter(id => id !== bankId));
    } else {
      if (selectedBanks.length < 3) {
        setSelectedBanks([...selectedBanks, bankId]);
      } else {
        alert('You can compare up to 3 banks at a time');
      }
    }
  };

  return (
    <div className="loan-comparison-container">
      <h1>Loan Comparison Tool</h1>
      
      <UserPreferencesForm 
        initialValues={userPreferences} 
        onSubmit={handlePreferencesSubmit} 
      />
      
      <div className="filter-section">
        <h2>Filter Loans</h2>
        
        <div className="filter-form">
          <div className="form-group">
            <label htmlFor="loanType">Loan Type</label>
            <select
              id="loanType"
              name="loanType"
              value={filters.loanType}
              onChange={handleFilterChange}
            >
              <option value="">All Loan Types</option>
              {loanTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="minAmount">Minimum Amount</label>
            <input
              type="number"
              id="minAmount"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleFilterChange}
              placeholder="Min Amount"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="maxAmount">Maximum Amount</label>
            <input
              type="number"
              id="maxAmount"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              placeholder="Max Amount"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="maxInterestRate">Max Interest Rate (%)</label>
            <input
              type="number"
              id="maxInterestRate"
              name="maxInterestRate"
              value={filters.maxInterestRate}
              onChange={handleFilterChange}
              placeholder="Max Interest Rate"
              step="0.1"
            />
          </div>
        </div>
      </div>
      
      <div className="loans-section">
        <h2>Available Loans</h2>
        
        {loading ? (
          <div className="loading">Loading loan data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredLoans.length === 0 ? (
          <div className="message">No loans match your criteria. Try adjusting your filters.</div>
        ) : (
          <div className="loan-cards">
            {filteredLoans.map(loan => (
              <LoanCard key={loan._id} loan={loan} />
            ))}
          </div>
        )}
      </div>

      {selectedBanks.length > 0 && (
        <div className="comparison-table">
          <h3>Compare Selected Banks</h3>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                {selectedBanks.map(id => {
                  const bank = loans.find(loan => loan._id === id);
                  return <th key={id}>{bank.bankName}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Interest Rate</td>
                {selectedBanks.map(id => {
                  const bank = loans.find(loan => loan._id === id);
                  return <td key={id}>{bank.interestRate}%</td>;
                })}
              </tr>
              <tr>
                <td>Processing Fee</td>
                {selectedBanks.map(id => {
                  const bank = loans.find(loan => loan._id === id);
                  return <td key={id}>{bank.processingFee}</td>;
                })}
              </tr>
              <tr>
                <td>Loan Amount</td>
                {selectedBanks.map(id => {
                  const bank = loans.find(loan => loan._id === id);
                  return <td key={id}>₹{bank.minLoanAmount.toLocaleString()} - ₹{bank.maxLoanAmount.toLocaleString()}</td>;
                })}
              </tr>
              <tr>
                <td>Tenure</td>
                {selectedBanks.map(id => {
                  const bank = loans.find(loan => loan._id === id);
                  return <td key={id}>{bank.minTenure} - {bank.maxTenure} months</td>;
                })}
              </tr>
              <tr>
                <td>EMI (for selected amount)</td>
                {selectedBanks.map(id => {
                  const bank = loans.find(loan => loan._id === id);
                  return <td key={id}>₹{bank.calculatedEMI?.toLocaleString() || 'N/A'}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LoanComparison; 