import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PersonalLoan.css';

const PersonalLoan: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="personal-loan-container">
            <div className="back-button" onClick={() => navigate('/loan-types')}>
                <ArrowLeft className="icon" />
                Back to Loan Types
            </div>

            <div className="personal-loan-content">
                <h1>Personal Loan</h1>
                <p className="subtitle">Quick and easy personal loans for your needs</p>

                <div className="loan-details">
                    <div className="detail-card">
                        <h3>Loan Amount</h3>
                        <p>₹10,000 - ₹50,00,000</p>
                    </div>
                    <div className="detail-card">
                        <h3>Interest Rate</h3>
                        <p>10.5% - 24% p.a.</p>
                    </div>
                    <div className="detail-card">
                        <h3>Tenure</h3>
                        <p>12 - 60 months</p>
                    </div>
                    <div className="detail-card">
                        <h3>Processing Fee</h3>
                        <p>0.5% - 2%</p>
                    </div>
                </div>

                <div className="features-section">
                    <h2>Features & Benefits</h2>
                    <ul>
                        <li>No collateral required</li>
                        <li>Quick disbursement</li>
                        <li>Flexible repayment options</li>
                        <li>Minimal documentation</li>
                        <li>Competitive interest rates</li>
                    </ul>
                </div>

                <div className="eligibility-section">
                    <h2>Eligibility Criteria</h2>
                    <ul>
                        <li>Age: 23-58 years</li>
                        <li>Minimum monthly income: ₹25,000</li>
                        <li>Employment stability: 2+ years</li>
                        <li>Good credit score (650+)</li>
                        <li>Indian resident</li>
                    </ul>
                </div>

                <button className="apply-button">
                    Apply Now
                </button>
            </div>
        </div>
    );
};

export default PersonalLoan; 