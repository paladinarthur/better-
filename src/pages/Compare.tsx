import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Lock, Shield, Plus, Trash } from 'lucide-react';
import './Compare.css';
import { calculateCreditScore, getLoanEligibility } from '../utils/creditScore';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils/formatNumber';
import axiosInstance from '../utils/axios';

interface LoanHistory {
    loanAmount: string;
    emiAmount: string;
    loanAge: string;
    interestRate: string;
}

interface CompareFormData {
    // Basic Information
    fullName: string;
    age: string;
    cityRegion: string;
    
    // Financial & Employment Details
    annualIncome: string;
    employmentType: 'Salaried' | 'Self-Employed' | 'Unemployed' | '';
    yearsInCurrentJob: string;
    
    // Previous Loans
    hasPreviousLoans: 'Yes' | 'No' | '';
    previousLoans: LoanHistory[];
    
    // Credit History
    loanRejectionHistory: 'Yes' | 'No' | '';
    
    // Credit Card Usage
    avgCreditCardUsage: string;

    // Credit Score
    creditScore?: string;
    isCalculatedScore?: boolean;
}

interface UserProfile {
    fullName: string;
    age: string;
}

const Compare: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = Boolean(localStorage.getItem('token'));
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<CompareFormData>({
        fullName: '',
        age: '',
        cityRegion: '',
        annualIncome: '',
        employmentType: '',
        yearsInCurrentJob: '',
        hasPreviousLoans: '',
        previousLoans: [],
        loanRejectionHistory: '',
        avgCreditCardUsage: '',
        creditScore: '',
        isCalculatedScore: false
    });
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [creditScore, setCreditScore] = useState<number | null>(null);
    const [hasCompletedComparison, setHasCompletedComparison] = useState(false);
    const [eligibilityData, setEligibilityData] = useState<any>(null);
    const [showCreditScoreOptions, setShowCreditScoreOptions] = useState(false);

    const totalSteps = 3;
    const progress = (currentStep / totalSteps) * 100;

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                const response = await axiosInstance.get('/api/user/details');
                if (response.data.success && response.data.user.profile) {
                    setUserProfile({
                        fullName: response.data.user.profile.fullName,
                        age: response.data.user.profile.age
                    });
                }
            } catch (error: any) {
                console.error('Error fetching user profile:', error);
                // If token is expired, clear it and continue as guest
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    setIsLoading(false);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        // Load saved comparison data if it exists
        const savedData = localStorage.getItem('comparisonData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                const { formData: savedFormData, creditScore: savedScore, completed } = parsedData;
                
                // Only set the form data and credit score if they exist
                if (savedFormData) {
                    setFormData(savedFormData);
                }
                
                if (savedScore) {
                    setCreditScore(savedScore);
                }
                
                // Only mark as completed if specifically set to true
                setHasCompletedComparison(completed === true);
            } catch (error) {
                console.error('Error parsing saved comparison data:', error);
                localStorage.removeItem('comparisonData');
            }
        }
    }, []);

    useEffect(() => {
        // Check if we have a return path in the URL (after login)
        const params = new URLSearchParams(location.search);
        const returnPath = params.get('returnTo');
        if (returnPath && isAuthenticated) {
            navigate(returnPath);
        }
    }, [location, isAuthenticated, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'hasPreviousLoans' && value === 'Yes' && formData.previousLoans.length === 0) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                previousLoans: [{
                    loanAmount: '',
                    emiAmount: '',
                    loanAge: '',
                    interestRate: ''
                }]
            }));
        } else if (name === 'hasPreviousLoans' && value === 'No') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                previousLoans: []
            }));
        } else if (isAmountField(name)) {
            // Only format if there's a value
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

    const handleLoanHistoryChange = (index: number, field: keyof LoanHistory, value: string) => {
        setFormData(prev => ({
            ...prev,
            previousLoans: prev.previousLoans.map((loan, i) => 
                i === index ? { 
                    ...loan, 
                    [field]: isAmountField(field) ? 
                        (value ? formatNumberWithCommas(value) : '') : 
                        value 
                } : loan
            )
        }));
    };

    const addNewLoan = () => {
        setFormData(prev => ({
            ...prev,
            previousLoans: [
                ...prev.previousLoans,
                { loanAmount: '', emiAmount: '', loanAge: '', interestRate: '' }
            ]
        }));
    };

    const removeLoan = (index: number) => {
        if (formData.previousLoans.length > 1) {
            setFormData(prev => ({
                ...prev,
                previousLoans: prev.previousLoans.filter((_, i) => i !== index)
            }));
        }
    };

    const validateCurrentStep = (): boolean => {
        switch (currentStep) {
            case 1:
                if (userProfile) {
                    return Boolean(formData.cityRegion);
                }
                return Boolean(
                    formData.fullName &&
                    formData.age &&
                    formData.cityRegion
                );
            case 2: // Financial & Employment
                return Boolean(
                    formData.annualIncome &&
                    formData.employmentType &&
                    formData.yearsInCurrentJob
                );
            case 3: // Loan History & Credit
                if (formData.hasPreviousLoans === 'Yes') {
                    return formData.previousLoans.every(loan => 
                        loan.loanAmount && 
                        loan.emiAmount && 
                        loan.loanAge
                    ) && Boolean(
                        formData.loanRejectionHistory &&
                        formData.avgCreditCardUsage
                    );
                }
                return Boolean(
                    formData.hasPreviousLoans &&
                    formData.loanRejectionHistory &&
                    formData.avgCreditCardUsage
                );
            default:
                return false;
        }
    };

    // Helper function to check if a field is an amount field
    const isAmountField = (fieldName: string): boolean => {
        return [
            'annualIncome',
            'avgCreditCardUsage',
            'loanAmount',
            'emiAmount'
        ].includes(fieldName);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Parse form data for calculation
            const parsedFormData = {
                ...formData,
                annualIncome: parseFormattedNumber(formData.annualIncome),
                avgCreditCardUsage: parseFormattedNumber(formData.avgCreditCardUsage),
                previousLoans: formData.previousLoans.map(loan => ({
                    ...loan,
                    loanAmount: parseFormattedNumber(loan.loanAmount),
                    emiAmount: parseFormattedNumber(loan.emiAmount)
                }))
            };

            // Calculate credit score if not provided by user
            let finalCreditScore: number;
            if (!formData.creditScore) {
                finalCreditScore = calculateCreditScore(parsedFormData);
                setFormData(prev => ({
                    ...prev,
                    isCalculatedScore: true
                }));
            } else {
                finalCreditScore = parseInt(formData.creditScore);
                setFormData(prev => ({
                    ...prev,
                    isCalculatedScore: false
                }));
            }
            setCreditScore(finalCreditScore);

            // Calculate eligibility for all loan types
            const newEligibilityData = {
                home: getLoanEligibility(finalCreditScore, 'home'),
                car: getLoanEligibility(finalCreditScore, 'car'),
                gold: getLoanEligibility(finalCreditScore, 'gold')
            };

            // Set eligibility data in state
            setEligibilityData(newEligibilityData);

            // Save comparison data to localStorage
            const comparisonData = {
                formData: parsedFormData,
                creditScore: finalCreditScore,
                completed: true
            };
            localStorage.setItem('comparisonData', JSON.stringify(comparisonData));
            
            // Wait to set completed until after the data is saved
            setTimeout(() => {
                setHasCompletedComparison(true);
            }, 100);

            // Store data in profile
            localStorage.setItem('pendingComparisonData', JSON.stringify(parsedFormData));
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleRecompare = () => {
        localStorage.removeItem('comparisonData');
        setFormData({
            fullName: '',
            age: '',
            cityRegion: '',
            annualIncome: '',
            employmentType: '',
            yearsInCurrentJob: '',
            hasPreviousLoans: '',
            previousLoans: [],
            loanRejectionHistory: '',
            avgCreditCardUsage: '',
            creditScore: '',
            isCalculatedScore: false
        });
        setCreditScore(null);
        setHasCompletedComparison(false);
        setEligibilityData(null);
        setCurrentStep(1);
        setShowCreditScoreOptions(false);
    };

    const handleSignInClick = () => {
        // Save current path to return to after login
        const currentPath = location.pathname + location.search;
        navigate(`/login?returnTo=${encodeURIComponent(currentPath)}`);
    };

    const renderCreditScoreOptions = () => {
        return (
            <div className="credit-score-options">
                <h2>Enter Your Credit Score</h2>
                <div className="options-container">
                    <div className="option-card">
                        <h3>I know my credit score</h3>
                        <div className="form-group">
                            <label htmlFor="creditScore">Enter your credit score</label>
                            <input
                                type="number"
                                id="creditScore"
                                name="creditScore"
                                value={formData.creditScore}
                                onChange={handleChange}
                                min="300"
                                max="900"
                                required
                            />
                        </div>
                    </div>
                    <div className="option-card">
                        <h3>I don't know my credit score</h3>
                        <p>We'll calculate it based on your information</p>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    creditScore: '',
                                    isCalculatedScore: true
                                }));
                                handleSubmit(new Event('submit') as any);
                            }}
                            className="calculate-button"
                        >
                            Calculate My Score
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep = () => {
        if (showCreditScoreOptions) {
            return renderCreditScoreOptions();
        }

        switch (currentStep) {
            case 1:
                return (
                    <div className="step-content">
                        <h2>Basic Information</h2>
                        {!userProfile && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="age">Age</label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <div className="form-group">
                            <label htmlFor="cityRegion">City/Region</label>
                            <input
                                type="text"
                                id="cityRegion"
                                name="cityRegion"
                                value={formData.cityRegion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="step-content">
                        <h2>Financial & Employment Details</h2>
                        <div className="form-group">
                            <label htmlFor="annualIncome">Annual Income</label>
                            <input
                                type="text"
                                id="annualIncome"
                                name="annualIncome"
                                value={formData.annualIncome}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="employmentType">Employment Type</label>
                            <select
                                id="employmentType"
                                name="employmentType"
                                value={formData.employmentType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select employment type</option>
                                <option value="Salaried">Salaried</option>
                                <option value="Self-Employed">Self-Employed</option>
                                <option value="Unemployed">Unemployed</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="yearsInCurrentJob">Years in Current Job</label>
                            <input
                                type="number"
                                id="yearsInCurrentJob"
                                name="yearsInCurrentJob"
                                value={formData.yearsInCurrentJob}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="step-content">
                        <h2>Loan History & Credit Information</h2>
                        <div className="form-group">
                            <label htmlFor="hasPreviousLoans">Do you have any previous loans?</label>
                            <select
                                id="hasPreviousLoans"
                                name="hasPreviousLoans"
                                value={formData.hasPreviousLoans}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        {formData.hasPreviousLoans === 'Yes' && (
                            <div className="loan-history-section">
                                <h3>Previous Loan Details</h3>
                                {formData.previousLoans.map((loan, index) => (
                                    <div key={index} className="loan-entry">
                                        <div className="loan-header">
                                            <h4>Loan {index + 1}</h4>
                                            {formData.previousLoans.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLoan(index)}
                                                    className="remove-loan"
                                                >
                                                    <Trash className="icon" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={`loanAmount-${index}`}>Loan Amount</label>
                                            <input
                                                type="text"
                                                id={`loanAmount-${index}`}
                                                value={loan.loanAmount}
                                                onChange={(e) => handleLoanHistoryChange(index, 'loanAmount', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={`emiAmount-${index}`}>EMI Amount</label>
                                            <input
                                                type="text"
                                                id={`emiAmount-${index}`}
                                                value={loan.emiAmount}
                                                onChange={(e) => handleLoanHistoryChange(index, 'emiAmount', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={`loanAge-${index}`}>Loan Age (months)</label>
                                            <input
                                                type="number"
                                                id={`loanAge-${index}`}
                                                value={loan.loanAge}
                                                onChange={(e) => handleLoanHistoryChange(index, 'loanAge', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor={`interestRate-${index}`}>Interest Rate (%)</label>
                                            <input
                                                type="number"
                                                id={`interestRate-${index}`}
                                                value={loan.interestRate}
                                                onChange={(e) => handleLoanHistoryChange(index, 'interestRate', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addNewLoan}
                                    className="add-loan"
                                >
                                    <Plus className="icon" />
                                    Add Another Loan
                                </button>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="loanRejectionHistory">Have you ever had a loan rejected?</label>
                            <select
                                id="loanRejectionHistory"
                                name="loanRejectionHistory"
                                value={formData.loanRejectionHistory}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select an option</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="avgCreditCardUsage">Average Monthly Credit Card Usage</label>
                            <input
                                type="text"
                                id="avgCreditCardUsage"
                                name="avgCreditCardUsage"
                                value={formData.avgCreditCardUsage}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    // Allow users to see their completed comparison, but only if they have explicitly chosen to
    if (hasCompletedComparison && creditScore !== null) {
        return (
            <div className="comparison-complete">
                <h2>Your Credit Score</h2>
                <div className="credit-score">
                    <span>{creditScore}</span>
                </div>
                <div className="credit-score-info">
                    {formData.isCalculatedScore ? (
                        <p>This score was calculated based on your information</p>
                    ) : (
                        <p>This is your provided credit score</p>
                    )}
                </div>
                <div className="action-buttons">
                    <button onClick={handleRecompare} className="recompare-button">
                        Start New Comparison
                    </button>
                    <button 
                        onClick={() => navigate('/loan-preferences')}
                        className="view-results-button"
                    >
                        Continue to Loan Preferences
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="compare-container">
            {!isAuthenticated && (
                <div className="sign-in-banner">
                    <p>
                        <span className="sign-in-text">Sign in to save your data</span>
                        <button onClick={handleSignInClick} className="sign-in-button">
                            Sign In
                        </button>
                    </p>
                </div>
            )}
            
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>

            {/* Add a reset button if there's saved data */}
            {localStorage.getItem('comparisonData') && (
                <div className="reset-container">
                    <button 
                        type="button" 
                        onClick={handleRecompare} 
                        className="reset-button"
                    >
                        Start New Comparison
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="compare-form">
                {renderStep()}

                <div className="button-group">
                    {currentStep > 1 && !showCreditScoreOptions && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev - 1)}
                            className="back-button"
                        >
                            <ArrowLeft className="icon" />
                            Back
                        </button>
                    )}
                    {currentStep < totalSteps && !showCreditScoreOptions ? (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="next-button"
                            disabled={!validateCurrentStep()}
                        >
                            Next
                            <ArrowRight className="icon" />
                        </button>
                    ) : showCreditScoreOptions ? (
                        <button type="submit" className="submit-button">
                            Continue
                            <ArrowRight className="icon" />
                        </button>
                    ) : (
                        <button 
                            type="button" 
                            onClick={() => setShowCreditScoreOptions(true)}
                            className="submit-button"
                        >
                            Continue to Credit Score
                            <ArrowRight className="icon" />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Compare;
