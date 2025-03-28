import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import './LoanPreferences.css';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils/formatNumber';

interface LoanPreferencesData {
    desiredLoanAmount: string;
    loanTenure: string;
    preferredInterestRate: string;
}

interface LoanPreferencesProps {
    onComplete: (data: LoanPreferencesData) => void;
    initialData?: LoanPreferencesData;
}

const LoanPreferences: React.FC<LoanPreferencesProps> = ({ onComplete, initialData }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoanPreferencesData>({
        desiredLoanAmount: initialData?.desiredLoanAmount || '',
        loanTenure: initialData?.loanTenure || '',
        preferredInterestRate: initialData?.preferredInterestRate || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'desiredLoanAmount') {
            const formattedValue = value ? formatNumberWithCommas(value) : '';
            setFormData(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        // Save preferences
        try {
            localStorage.setItem('loanPreferences', JSON.stringify(formData));
            setSuccessMessage('Preferences saved successfully! Redirecting to loan types...');
            console.log('Loan preferences saved. Redirecting to loan types page...');
            
            // Create and append loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.innerHTML = '<div style="margin-top: 20px; text-align: center; font-weight: bold;">Redirecting in 1 second...</div>';
            document.querySelector('.success-message')?.appendChild(loadingIndicator);
            
            // Use direct redirection for reliability
            setTimeout(() => {
                window.location.href = '/loan-types';
            }, 1000);
        } catch (error) {
            console.error('Error saving preferences:', error);
            setErrorMessage('Failed to save preferences. Please try again.');
            setIsSubmitting(false);
        }
    };

    const validateForm = () => {
        // Implement form validation logic here
        return true; // Placeholder return, actual implementation needed
    };

    return (
        <div className="loan-preferences-container">
            <div className="progress-bar">
                <div className="progress" style={{ width: '100%' }}></div>
            </div>
            
            <form onSubmit={handleSubmit} className="loan-preferences-form">
                <h2>Loan Preferences</h2>
                
                <div className="form-group">
                    <label htmlFor="desiredLoanAmount">Desired Loan Amount</label>
                    <div className="input-with-prefix">
                        <span className="prefix">₹</span>
                        <input
                            type="text"
                            id="desiredLoanAmount"
                            name="desiredLoanAmount"
                            value={formData.desiredLoanAmount}
                            onChange={handleChange}
                            placeholder="Enter amount"
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="loanTenure">Preferred Loan Tenure</label>
                    <select
                        id="loanTenure"
                        name="loanTenure"
                        value={formData.loanTenure}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select tenure</option>
                        <option value="12">1 Year</option>
                        <option value="24">2 Years</option>
                        <option value="36">3 Years</option>
                        <option value="48">4 Years</option>
                        <option value="60">5 Years</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="preferredInterestRate">Preferred Interest Rate (%)</label>
                    <input
                        type="number"
                        id="preferredInterestRate"
                        name="preferredInterestRate"
                        value={formData.preferredInterestRate}
                        onChange={handleChange}
                        placeholder="Enter preferred rate"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                    />
                </div>

                <div className="button-group">
                    <button type="button" onClick={() => navigate(-1)} className="back-button">
                        <ArrowLeft className="icon" />
                        Back
                    </button>
                    <button 
                        type="submit" 
                        className="next-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Continue to Loan Types'}
                        <ArrowRight className="icon" />
                    </button>
                </div>
            </form>

            {successMessage && (
                <div className="success-message">
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                </div>
            )}
        </div>
    );
};

export default LoanPreferences; 