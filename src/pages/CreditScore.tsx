import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, CreditCard } from 'lucide-react';
import './CreditScore.css';

const CreditScore: React.FC = () => {
    const [isManualEntry, setIsManualEntry] = useState<boolean>(true);
    const [formData, setFormData] = useState({
        creditScore: '',
        monthlyIncome: '',
        monthlyExpenses: '',
        savings: '',
        creditHistory: '',
        paymentHistory: '',
        creditCardUsage: '',
        creditCardLimit: '',
        employmentType: '',
        employmentDuration: ''
    });
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for comparison data
        const comparisonData = localStorage.getItem('pendingComparisonData');
        if (comparisonData) {
            try {
                const data = JSON.parse(comparisonData);
                // Only update form data if the values are valid
                const validData = Object.entries(data).reduce((acc, [key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        acc[key] = value;
                    }
                    return acc;
                }, {} as Record<string, any>);

                if (Object.keys(validData).length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        ...validData
                    }));
                }
            } catch (error) {
                console.error('Error parsing comparison data:', error);
            }
        }
    }, []);

    const calculateCreditScore = () => {
        let score = 0;
        
        // Income factor (30%)
        const incomeScore = (parseInt(formData.monthlyIncome) / 50000) * 30;
        score += Math.min(incomeScore, 30);

        // Savings factor (20%)
        const savingsScore = (parseInt(formData.savings) / 10000) * 20;
        score += Math.min(savingsScore, 20);

        // Credit history (20%)
        if (formData.creditHistory === 'excellent') score += 20;
        else if (formData.creditHistory === 'good') score += 15;
        else if (formData.creditHistory === 'fair') score += 10;
        else if (formData.creditHistory === 'poor') score += 5;

        // Payment history (15%)
        if (formData.paymentHistory === 'excellent') score += 15;
        else if (formData.paymentHistory === 'good') score += 10;
        else if (formData.paymentHistory === 'fair') score += 5;
        else if (formData.paymentHistory === 'poor') score += 2;

        // Credit utilization (15%)
        if (formData.creditCardLimit && formData.creditCardUsage) {
            const utilizationScore = (parseInt(formData.creditCardUsage) / parseInt(formData.creditCardLimit)) * 15;
            score += Math.min(utilizationScore, 15);
        }

        return Math.round(score);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            let creditScore;
            // Validate inputs based on entry mode
            if (isManualEntry) {
                if (!formData.creditScore) {
                    setError('Please enter your credit score');
                    setLoading(false);
                    return;
                }
                creditScore = parseInt(formData.creditScore);
                if (isNaN(creditScore) || creditScore < 300 || creditScore > 900) {
                    setError('Please enter a valid credit score between 300 and 900');
                    setLoading(false);
                    return;
                }
            } else {
                // Validate calculation fields
                if (!formData.monthlyIncome || !formData.savings || !formData.creditHistory || 
                    !formData.paymentHistory || !formData.creditCardUsage || !formData.creditCardLimit) {
                    setError('Please fill in all required fields');
                    setLoading(false);
                    return;
                }
                creditScore = calculateCreditScore();
            }
            
            // Save credit score to localStorage
            localStorage.setItem('userCreditScore', creditScore.toString());
            if (!isManualEntry) {
                localStorage.setItem('creditScoreCalculationData', JSON.stringify(formData));
            }
            
            // Update comparison data
            const comparisonData = localStorage.getItem('comparisonData');
            if (comparisonData) {
                const parsedData = JSON.parse(comparisonData);
                localStorage.setItem('comparisonData', JSON.stringify({
                    ...parsedData,
                    creditScore
                }));
            }
            
            // Show success and prepare for redirect
            setSuccess('Credit score assessed! Redirecting to loan preferences...');
            console.log('Credit score assessed. Redirecting to loan preferences page...');
            
            // Create visual indicator for redirection
            const loadingIndicator = document.createElement('div');
            loadingIndicator.innerHTML = '<div style="margin-top: 20px; text-align: center; font-weight: bold;">Redirecting in 1 second...</div>';
            document.querySelector('.success-message')?.appendChild(loadingIndicator);
            
            // Use direct redirection for reliability
            setTimeout(() => {
                window.location.href = '/loan-preferences';
            }, 1000);
            
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred while processing your credit score');
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    return (
        <div className="credit-score-container">
            <div className="credit-score-card">
                <h2>Credit Score Information</h2>
                <p className="description">
                    Your credit score is an important factor in determining loan eligibility and interest rates.
                </p>

                <div className="tabs">
                    <button 
                        className={`tab ${isManualEntry ? 'active' : ''}`}
                        onClick={() => setIsManualEntry(true)}
                    >
                        I know my credit score
                    </button>
                    <button 
                        className={`tab ${!isManualEntry ? 'active' : ''}`}
                        onClick={() => setIsManualEntry(false)}
                    >
                        Calculate my credit score
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="credit-score-form">
                    {isManualEntry ? (
                        <div className="form-group">
                            <label htmlFor="creditScore">Enter Your Credit Score</label>
                            <input
                                type="number"
                                id="creditScore"
                                name="creditScore"
                                min="300"
                                max="900"
                                value={formData.creditScore}
                                onChange={handleInputChange}
                                placeholder="Enter score between 300-900"
                            />
                        </div>
                    ) : (
                        <div className="calculation-fields">
                            <div className="form-group">
                                <label htmlFor="monthlyIncome">Monthly Income</label>
                                <input
                                    type="number"
                                    id="monthlyIncome"
                                    name="monthlyIncome"
                                    value={formData.monthlyIncome}
                                    onChange={handleInputChange}
                                    placeholder="Enter your monthly income"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="savings">Monthly Savings</label>
                                <input
                                    type="number"
                                    id="savings"
                                    name="savings"
                                    value={formData.savings}
                                    onChange={handleInputChange}
                                    placeholder="Enter your monthly savings"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="creditHistory">Credit History</label>
                                <select
                                    id="creditHistory"
                                    name="creditHistory"
                                    value={formData.creditHistory}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select credit history</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="paymentHistory">Payment History</label>
                                <select
                                    id="paymentHistory"
                                    name="paymentHistory"
                                    value={formData.paymentHistory}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select payment history</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="creditCardUsage">Credit Card Usage</label>
                                <input
                                    type="number"
                                    id="creditCardUsage"
                                    name="creditCardUsage"
                                    value={formData.creditCardUsage}
                                    onChange={handleInputChange}
                                    placeholder="Enter credit card usage"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="creditCardLimit">Credit Card Limit</label>
                                <input
                                    type="number"
                                    id="creditCardLimit"
                                    name="creditCardLimit"
                                    value={formData.creditCardLimit}
                                    onChange={handleInputChange}
                                    placeholder="Enter credit card limit"
                                />
                            </div>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <button type="submit" className="submit-button">
                        {isManualEntry ? 'Save & Continue' : 'Calculate & Save'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreditScore; 