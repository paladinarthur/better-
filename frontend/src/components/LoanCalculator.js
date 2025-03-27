import React, { useState, useEffect } from 'react';

const LoanCalculator = ({ loanAmount, tenure, interestRate, onCalculate }) => {
  const [amount, setAmount] = useState(loanAmount || 2000000);
  const [months, setMonths] = useState(tenure || 240);
  const [rate, setRate] = useState(interestRate || 8.5);
  const [emi, setEmi] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  
  useEffect(() => {
    calculateLoan();
  }, [amount, months, rate]);
  
  const calculateLoan = () => {
    const monthlyRate = rate / 12 / 100;
    const emiValue = amount * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                    (Math.pow(1 + monthlyRate, months) - 1);
    
    setEmi(Math.round(emiValue));
    setTotalPayment(Math.round(emiValue * months));
    setTotalInterest(Math.round(emiValue * months - amount));
    
    if (onCalculate) {
      onCalculate({
        emi: Math.round(emiValue),
        totalPayment: Math.round(emiValue * months),
        totalInterest: Math.round(emiValue * months - amount)
      });
    }
  };
  
  return (
    <div className="loan-calculator">
      <h3>Loan Calculator</h3>
      
      <div className="calculator-input">
        <label>Loan Amount (₹)</label>
        <input 
          type="range" 
          min="100000" 
          max="10000000" 
          step="100000" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))} 
        />
        <span>₹{amount.toLocaleString()}</span>
      </div>
      
      <div className="calculator-input">
        <label>Loan Tenure (months)</label>
        <input 
          type="range" 
          min="12" 
          max="360" 
          step="12" 
          value={months} 
          onChange={(e) => setMonths(Number(e.target.value))} 
        />
        <span>{months} months ({Math.floor(months/12)} years)</span>
      </div>
      
      <div className="calculator-input">
        <label>Interest Rate (%)</label>
        <input 
          type="range" 
          min="5" 
          max="15" 
          step="0.1" 
          value={rate} 
          onChange={(e) => setRate(Number(e.target.value))} 
        />
        <span>{rate}%</span>
      </div>
      
      <div className="calculator-results">
        <div className="result-item">
          <span>Monthly EMI</span>
          <strong>₹{emi.toLocaleString()}</strong>
        </div>
        <div className="result-item">
          <span>Total Interest</span>
          <strong>₹{totalInterest.toLocaleString()}</strong>
        </div>
        <div className="result-item">
          <span>Total Payment</span>
          <strong>₹{totalPayment.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator; 