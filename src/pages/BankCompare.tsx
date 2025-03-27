import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './BankCompare.css';

interface Bank {
    id: string;
    name: string;
    logo: string;
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
    features: string[];
}

const BankCompare: React.FC = () => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        loanAmount: '',
        tenure: '',
        employmentType: '',
        minSalary: '',
        processingFee: false,
        balanceTransfer: false,
        partPayment: false,
        doorstepService: false,
        noGuarantor: false,
        eApproval: false
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/banks/compare', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setBanks(response.data.banks);
            } catch (error) {
                console.error('Error fetching banks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanks();
    }, []);

    const handleFilterChange = (key: string, value: string | boolean) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const filteredBanks = banks.filter(bank => {
        if (filters.loanAmount && parseInt(filters.loanAmount) > bank.loanAmount.max) return false;
        if (filters.tenure && parseInt(filters.tenure) > bank.tenure.max) return false;
        // Add more filter conditions as needed
        return true;
    });

    return (
        <div className="bank-compare-container">
            <div className="filters-section">
                <h2>Filters</h2>
                <div className="filter-group">
                    <label>Loan Amount</label>
                    <input
                        type="number"
                        value={filters.loanAmount}
                        onChange={(e) => handleFilterChange('loanAmount', e.target.value)}
                        placeholder="Enter amount"
                    />
                </div>

                <div className="filter-group">
                    <label>Tenure (months)</label>
                    <input
                        type="number"
                        value={filters.tenure}
                        onChange={(e) => handleFilterChange('tenure', e.target.value)}
                        placeholder="Enter tenure"
                    />
                </div>

                <div className="filter-group">
                    <label>Employment Type</label>
                    <select
                        value={filters.employmentType}
                        onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="salaried">Salaried</option>
                        <option value="self-employed">Self Employed</option>
                        <option value="business">Business Owner</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Minimum Salary</label>
                    <input
                        type="number"
                        value={filters.minSalary}
                        onChange={(e) => handleFilterChange('minSalary', e.target.value)}
                        placeholder="Enter minimum salary"
                    />
                </div>

                <div className="filter-features">
                    <h3>Features</h3>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.processingFee}
                            onChange={(e) => handleFilterChange('processingFee', e.target.checked)}
                        />
                        Zero Processing Fee
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.balanceTransfer}
                            onChange={(e) => handleFilterChange('balanceTransfer', e.target.checked)}
                        />
                        Balance Transfer
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.partPayment}
                            onChange={(e) => handleFilterChange('partPayment', e.target.checked)}
                        />
                        Part Payment Available
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.doorstepService}
                            onChange={(e) => handleFilterChange('doorstepService', e.target.checked)}
                        />
                        Door Step Service
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.noGuarantor}
                            onChange={(e) => handleFilterChange('noGuarantor', e.target.checked)}
                        />
                        No Guarantor Required
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.eApproval}
                            onChange={(e) => handleFilterChange('eApproval', e.target.checked)}
                        />
                        E-Approval
                    </label>
                </div>
            </div>

            <div className="banks-section">
                <div className="top-picks">
                    <span className="tag">Top picks for you</span>
                    <div className="features-tags">
                        <span className="tag">Balance Transfer</span>
                        <span className="tag">Part-Payment Available</span>
                        <span className="tag">Top-up Loan Available</span>
                        <span className="tag">Door Step Service</span>
                        <span className="tag">No Guarantor Required</span>
                        <span className="tag">E-Approval</span>
                    </div>
                </div>

                <div className="bank-cards">
                    {loading ? (
                        <div className="loading">Loading banks...</div>
                    ) : (
                        filteredBanks.map(bank => (
                            <div key={bank.id} className="bank-card">
                                <div className="bank-header">
                                    <img src={bank.logo} alt={bank.name} className="bank-logo" />
                                    <h3>{bank.name}</h3>
                                </div>
                                <div className="bank-details">
                                    <div className="detail-item">
                                        <span>Loan Amount:</span>
                                        <span>₹{bank.loanAmount.min.toLocaleString()} - ₹{bank.loanAmount.max.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Interest Rate:</span>
                                        <span>{bank.interestRate.min}% - {bank.interestRate.max}%</span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Tenure:</span>
                                        <span>{bank.tenure.min} - {bank.tenure.max} Years</span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Processing Fee:</span>
                                        <span>{bank.processingFee}</span>
                                    </div>
                                </div>
                                <div className="bank-features">
                                    {bank.features.map((feature, index) => (
                                        <span key={index} className="feature-tag">{feature}</span>
                                    ))}
                                </div>
                                <div className="bank-actions">
                                    <button className="explore-btn">Explore</button>
                                    <button className="apply-btn">Apply Now</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BankCompare; 