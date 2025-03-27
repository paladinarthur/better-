import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './StudentLoan.css';

const StudentLoan: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="student-loan-container">
            <div className="back-button" onClick={() => navigate('/loan-types')}>
                <ArrowLeft className="icon" />
                Back to Loan Types
            </div>

            <div className="student-loan-content">
                <h1>Student Loan</h1>
                <p className="subtitle">Invest in your education with our student loan options</p>

                <div className="loan-details">
                    <div className="detail-card">
                        <h3>Loan Amount</h3>
                        <p>₹50,000 - ₹20,00,000</p>
                    </div>
                    <div className="detail-card">
                        <h3>Interest Rate</h3>
                        <p>8.5% - 12% p.a.</p>
                    </div>
                    <div className="detail-card">
                        <h3>Course Duration</h3>
                        <p>Up to 5 years</p>
                    </div>
                    <div className="detail-card">
                        <h3>Processing Fee</h3>
                        <p>1% - 2%</p>
                    </div>
                </div>

                <div className="features-section">
                    <h2>Features & Benefits</h2>
                    <ul>
                        <li>No collateral required</li>
                        <li>Coverage for tuition fees and living expenses</li>
                        <li>Flexible repayment options</li>
                        <li>Moratorium period available</li>
                        <li>Special rates for meritorious students</li>
                    </ul>
                </div>

                <div className="eligibility-section">
                    <h2>Eligibility Criteria</h2>
                    <ul>
                        <li>Age: 18-35 years</li>
                        <li>Admission to recognized institutions</li>
                        <li>Indian resident</li>
                        <li>Co-applicant required (parent/guardian)</li>
                        <li>Good academic record</li>
                    </ul>
                </div>

                <div className="courses-covered">
                    <h2>Courses Covered</h2>
                    <ul>
                        <li>Graduate programs</li>
                        <li>Post-graduate programs</li>
                        <li>Professional courses</li>
                        <li>Technical courses</li>
                        <li>Study abroad programs</li>
                    </ul>
                </div>

                <button className="apply-button">
                    Apply Now
                </button>
            </div>
        </div>
    );
};

export default StudentLoan; 