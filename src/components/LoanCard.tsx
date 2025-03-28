import React from 'react';
import './LoanCard.css';

interface LoanOffer {
  bankName: string;
  loanAmount: {
    min: number;
    max: number;
  };
  interestRate: {
    min: number;
    max: number;
  };
  tenure: {
    min: number;
    max: number;
  };
  processingFee: string;
  isInstant?: boolean;
  isPaperless?: boolean;
}

interface LoanCardProps {
  offer: LoanOffer;
}

const LoanCard: React.FC<LoanCardProps> = ({ offer }) => {
  return (
    <div className="loan-card">
      {(offer.isInstant || offer.isPaperless) && (
        <div className="loan-card-tags">
          {offer.isPaperless && (
            <div className="tag paperless">
              <span>100% Paperless Approval</span>
            </div>
          )}
          {offer.isInstant && (
            <div className="tag instant">
              <span>Instant Approval</span>
            </div>
          )}
        </div>
      )}

      <div className="bank-info">
        <div className="bank-logo">
          <img src={`/bank-logos/${offer.bankName.toLowerCase().replace(' ', '-')}.png`} alt={offer.bankName} />
        </div>
        <h3>{offer.bankName}</h3>
      </div>

      <div className="loan-details">
        <div className="detail-row">
          <span>Loan Amount:</span>
          <span>₹{offer.loanAmount.min.toLocaleString()} - ₹{offer.loanAmount.max.toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span>Interest Rate:</span>
          <span>{offer.interestRate.min}% - {offer.interestRate.max}%</span>
        </div>
        <div className="detail-row">
          <span>Tenure:</span>
          <span>{offer.tenure.min} - {offer.tenure.max} Years</span>
        </div>
        <div className="detail-row">
          <span>Processing Fee:</span>
          <span>{offer.processingFee}</span>
        </div>
      </div>

      <button className="see-more-btn">See More</button>
    </div>
  );
};

export default LoanCard; 