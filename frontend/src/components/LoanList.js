import React from 'react';
import LoanCard from './LoanCard';

const LoanList = ({ loans }) => {
  return (
    <div className="loan-list">
      <h2>Matching Loans ({loans.length})</h2>
      
      {loans.length === 0 ? (
        <p>No matching loans found. Try adjusting your preferences.</p>
      ) : (
        <div className="loan-grid">
          {loans.map(loan => (
            <LoanCard key={loan._id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LoanList; 