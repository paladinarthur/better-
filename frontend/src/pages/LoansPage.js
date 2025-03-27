import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoanCard from '../components/LoanCard';
import LoanCalculator from '../components/LoanCalculator';
import '../styles/LoansPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LoansPage = () => {
  const { loanType } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minAmount: queryParams.get('amount') || '',
    maxInterestRate: '',
    minTenure: queryParams.get('tenure') || '',
    maxTenure: ''
  });
  const [calculatorValues, setCalculatorValues] = useState({
    loanAmount: parseInt(queryParams.get('amount')) || 1000000,
    tenure: parseInt(queryParams.get('tenure')) || 60
  });
  
  // Format loan type for display
  const formatLoanType = (type) => {
    if (!type) return 'All Loans';
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };
  
  const displayLoanType = formatLoanType(loanType);
  
  // Fetch loans based on type
  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = `${API_BASE_URL}/banks`;
        
        if (loanType) {
          url = `${API_BASE_URL}/banks/type/${loanType}`;
        }
        
        const response = await axios.get(url);
        
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
    
    fetchLoans();
  }, [loanType]);
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  // Apply filters to loans
  const filteredLoans = loans.filter(loan => {
    // Filter by min amount
    if (filters.minAmount && loan.minLoanAmount > parseInt(filters.minAmount)) {
      return false;
    }
    
    // Filter by max interest rate
    if (filters.maxInterestRate && loan.interestRate > parseFloat(filters.maxInterestRate)) {
      return false;
    }
    
    // Filter by min tenure
    if (filters.minTenure && loan.maxTenure < parseInt(filters.minTenure)) {
      return false;
    }
    
    // Filter by max tenure
    if (filters.maxTenure && loan.minTenure > parseInt(filters.maxTenure)) {
      return false;
    }
    
    return true;
  });
  
  // Handle calculator updates
  const handleCalculatorUpdate = (values) => {
    // Update loan cards with EMI calculations
    const loansWithEMI = loans.map(loan => {
      const monthlyRate = loan.interestRate / 12 / 100;
      const emi = values.loanAmount * monthlyRate * Math.pow(1 + monthlyRate, values.tenure) / 
                 (Math.pow(1 + monthlyRate, values.tenure) - 1);
      
      return {
        ...loan,
        calculatedEMI: Math.round(emi),
        totalPayment: Math.round(emi * values.tenure),
        totalInterest: Math.round(emi * values.tenure - values.loanAmount)
      };
    });
    
    setLoans(loansWithEMI);
  };
  
  return (
    <div className="loans-page">
      <div className="loans-header">
        <h1>{displayLoanType}</h1>
        <p>Compare and find the best {displayLoanType.toLowerCase()} options for your needs</p>
      </div>
      
      <div className="loans-container">
        <div className="loans-sidebar">
          <div className="filter-section">
            <h3>Filter Options</h3>
            
            <div className="filter-group">
              <label htmlFor="minAmount">Loan Amount (₹)</label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                placeholder="Enter amount"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="maxInterestRate">Max Interest Rate (%)</label>
              <input
                type="number"
                id="maxInterestRate"
                name="maxInterestRate"
                value={filters.maxInterestRate}
                onChange={handleFilterChange}
                placeholder="Max rate"
                step="0.1"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="minTenure">Min Tenure (months)</label>
              <input
                type="number"
                id="minTenure"
                name="minTenure"
                value={filters.minTenure}
                onChange={handleFilterChange}
                placeholder="Min tenure"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="maxTenure">Max Tenure (months)</label>
              <input
                type="number"
                id="maxTenure"
                name="maxTenure"
                value={filters.maxTenure}
                onChange={handleFilterChange}
                placeholder="Max tenure"
              />
            </div>
          </div>
          
          <LoanCalculator
            loanAmount={calculatorValues.loanAmount}
            tenure={calculatorValues.tenure}
            onCalculate={(values) => {
              setCalculatorValues({
                loanAmount: values.loanAmount,
                tenure: values.tenure
              });
              handleCalculatorUpdate(values);
            }}
          />
        </div>
        
        <div className="loans-content">
          {loading ? (
            <div className="loading">Loading loan options...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredLoans.length === 0 ? (
            <div className="no-results">
              <h3>No loans match your criteria</h3>
              <p>Try adjusting your filters or check back later for more options.</p>
            </div>
          ) : (
            <div className="loan-cards">
              {filteredLoans.map(loan => (
                <LoanCard 
                  key={loan._id} 
                  loan={loan} 
                  showApplyButton={true}
                  calculatedValues={{
                    emi: loan.calculatedEMI,
                    totalPayment: loan.totalPayment,
                    totalInterest: loan.totalInterest
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoansPage; 