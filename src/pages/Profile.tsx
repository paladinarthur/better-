import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, CreditCard, Calendar, Shield, DollarSign, Building, Clock, CreditCard as CreditCardIcon, AlertCircle } from 'lucide-react';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import { formatNumberWithCommas, parseFormattedNumber } from '../utils/formatNumber';

interface PreviousLoan {
    loanAmount: string;
    emiAmount: string;
    loanAge: string;
    interestRate: string;
}

const Profile: React.FC = () => {
    const [userProfile, setUserProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        age: '',
        panCard: '',
        aadharNumber: '',
        occupation: '',
        // Additional fields from Compare
        cityRegion: '',
        annualIncome: '',
        employmentType: '',
        yearsInCurrentJob: '',
        hasPreviousLoans: '',
        previousLoans: [] as PreviousLoan[],
        loanRejectionHistory: '',
        avgCreditCardUsage: '',
    });
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [comparisonData, setComparisonData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

        const fetchUserData = async () => {
            try {
            console.log('Fetching user profile data...');
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('No auth token available');
                return;
            }
            
                const [profileRes, comparisonRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/user/details', {
                        headers: { 
                        Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }),
                    axios.get('http://localhost:5000/api/user/latest-comparison', {
                        headers: { 
                        Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ]);

            if (profileRes.data?.success && profileRes.data?.user) {
                    const { profile, email } = profileRes.data.user;
                    
                if (!profile) {
                    console.warn('Profile data is missing in the API response');
                    return;
                }
                
                // Make sure we're getting all fields with proper defaults
                    const updatedProfile = {
                        fullName: profile.fullName || '',
                        email: email || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                        dateOfBirth: profile.dateOfBirth || '',
                        age: profile.age?.toString() || '',
                        panCard: profile.panCard || '',
                        aadharNumber: profile.aadharNumber || '',
                    occupation: profile.occupation || '',
                    // Additional fields from Compare
                    cityRegion: profile.cityRegion || '',
                    annualIncome: profile.annualIncome ? formatNumberWithCommas(profile.annualIncome) : '',
                    employmentType: profile.employmentType || '',
                    yearsInCurrentJob: profile.yearsInCurrentJob || '',
                    hasPreviousLoans: profile.hasPreviousLoans || '',
                    previousLoans: Array.isArray(profile.previousLoans) ? profile.previousLoans : [],
                    loanRejectionHistory: profile.loanRejectionHistory || '',
                    avgCreditCardUsage: profile.avgCreditCardUsage ? formatNumberWithCommas(profile.avgCreditCardUsage) : '',
                };

                console.log('Setting profile state with data:', updatedProfile);
                    setUserProfile(updatedProfile);
            } else {
                console.warn('API response did not indicate success or is missing user data', profileRes.data);
                }

                if (comparisonRes.data?.success) {
                    setComparisonData(comparisonRes.data.comparison);
                }
            } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to fetch profile data. Please try again later.');
        }
    };

    useEffect(() => {
        // Check if first-time user
        const firstTimeFlag = localStorage.getItem('isFirstTimeUser');
        setIsFirstTimeUser(!!firstTimeFlag);
        
        // If first-time user, start in editing mode
        if (firstTimeFlag) {
            setIsEditing(true);
        }

        fetchUserData();
    }, []);

    const validateProfile = () => {
        // For first-time users, validate all required fields
        if (isFirstTimeUser) {
            const requiredFields = [
                'fullName', 'phone', 'address', 'dateOfBirth', 'age', 
                'panCard', 'aadharNumber', 'occupation', 'cityRegion',
                'annualIncome', 'employmentType', 'yearsInCurrentJob',
                'hasPreviousLoans', 'loanRejectionHistory', 'avgCreditCardUsage'
            ];
            
            const missingFields = requiredFields.filter(field => {
                if (field === 'hasPreviousLoans' && userProfile[field] === 'No') {
                    return false;
                }
                if (field === 'previousLoans' && userProfile.hasPreviousLoans === 'No') {
                    return false;
                }
                return !userProfile[field];
            });
            
            if (missingFields.length > 0) {
                setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
                return false;
            }
            
            // If has previous loans is Yes, validate that at least one loan is filled out
            if (userProfile.hasPreviousLoans === 'Yes' && (!userProfile.previousLoans || userProfile.previousLoans.length === 0)) {
                setError('Please add at least one previous loan');
                return false;
            }
        }
        
        return true;
    };

    const handleAddPreviousLoan = () => {
        setUserProfile(prev => ({
            ...prev,
            previousLoans: [
                ...prev.previousLoans,
                { loanAmount: '', emiAmount: '', loanAge: '', interestRate: '' }
            ]
        }));
    };

    const handleRemoveLoan = (index: number) => {
        setUserProfile(prev => ({
            ...prev,
            previousLoans: prev.previousLoans.filter((_, i) => i !== index)
        }));
    };

    const handleLoanChange = (index: number, field: keyof PreviousLoan, value: string) => {
        setUserProfile(prev => ({
            ...prev,
            previousLoans: prev.previousLoans.map((loan, i) => 
                i === index ? { 
                    ...loan, 
                    [field]: ['loanAmount', 'emiAmount'].includes(field) ?
                        (value ? formatNumberWithCommas(value) : '') : 
                        value 
                } : loan
            )
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (['annualIncome', 'avgCreditCardUsage'].includes(name)) {
            const formattedValue = value ? formatNumberWithCommas(value) : '';
            setUserProfile(prev => ({
                ...prev,
                [name]: formattedValue
            }));
        } else if (name === 'hasPreviousLoans' && value === 'Yes' && userProfile.previousLoans.length === 0) {
            setUserProfile(prev => ({
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
            setUserProfile(prev => ({
                ...prev,
                [name]: value,
                previousLoans: []
            }));
        } else {
            setUserProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        setError('');
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateProfile()) {
            if (isFirstTimeUser) {
                alert('Please fill in all required fields before proceeding');
            }
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        setSuccess('');
        
        try {
            const token = localStorage.getItem('token');
            
            // Parse formatted numbers
            const profileToSubmit = {
                ...userProfile,
                annualIncome: userProfile.annualIncome ? parseFormattedNumber(userProfile.annualIncome) : '',
                avgCreditCardUsage: userProfile.avgCreditCardUsage ? parseFormattedNumber(userProfile.avgCreditCardUsage) : '',
                previousLoans: userProfile.previousLoans.map(loan => ({
                    ...loan,
                    loanAmount: loan.loanAmount ? parseFormattedNumber(loan.loanAmount) : '',
                    emiAmount: loan.emiAmount ? parseFormattedNumber(loan.emiAmount) : '',
                }))
            };
            
            // Log the data we're sending
            console.log('Sending profile data:', { profile: profileToSubmit });

            const response = await axios.post(
                'http://localhost:5000/api/user/details',
                { profile: profileToSubmit },
                {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Server response:', response.data); // Debug log

            if (response.data?.success) {
                if (isFirstTimeUser) {
                    localStorage.removeItem('isFirstTimeUser');
                    setIsFirstTimeUser(false);
                    
                    // Save profile data for future use in loan flow
                    localStorage.setItem('comparisonData', JSON.stringify({
                        formData: profileToSubmit
                    }));
                    
                    // Use more reliable method for navigation with a loading indicator
                    console.log('Profile completed. Redirecting to credit score page now...');
                    
                    // Display loading indicator then redirect
                    setSuccess('Profile updated successfully! Redirecting to credit score assessment...');
                    
                    // Create and append loading indicator
                    const loadingIndicator = document.createElement('div');
                    loadingIndicator.innerHTML = '<div style="margin-top: 20px; text-align: center; font-weight: bold;">Redirecting in 1 second...</div>';
                    document.querySelector('.success-message')?.appendChild(loadingIndicator);
                    
                    // Forced redirect after shorter timeout
                    setTimeout(() => {
                        window.location.href = '/creditscore';
                    }, 1000);
                } else {
                    // Show success message for regular users
                setSuccess('Profile updated successfully!');
                    
                    // Exit editing mode
                setIsEditing(false);
                    
                    // Refresh the profile data after a slight delay
                    // to ensure the server has processed the update
                    setTimeout(async () => {
                await fetchUserData();
                    }, 500);
                }
            } else {
                throw new Error(response.data?.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
            // Don't exit edit mode on error so user can correct and retry
        } finally {
            setIsSubmitting(false);
        }
    };

    // Additional section for loan history in the form
    const renderLoanHistorySection = () => {
        if (!isEditing) return null;
        
        return (
            <div className="profile-section loan-history">
                <h2>Loan History</h2>
                <div className="form-group">
                    <label>Do you have any existing loans?</label>
                    <select
                        name="hasPreviousLoans"
                        value={userProfile.hasPreviousLoans}
                        onChange={handleChange}
                        className="select-styled"
                    >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                
                {userProfile.hasPreviousLoans === 'Yes' && (
                    <div className="loan-history-items">
                        {userProfile.previousLoans.map((loan, index) => (
                            <div key={index} className="loan-history-item">
                                <h3>Loan {index + 1}</h3>
                                <div className="loan-form-grid">
                                    <div className="form-group">
                                        <label>Loan Amount</label>
                                        <div className="input-with-prefix">
                                            <span className="prefix">₹</span>
                                            <input
                                                type="text"
                                                value={loan.loanAmount}
                                                onChange={(e) => handleLoanChange(index, 'loanAmount', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>EMI Amount</label>
                                        <div className="input-with-prefix">
                                            <span className="prefix">₹</span>
                                            <input
                                                type="text"
                                                value={loan.emiAmount}
                                                onChange={(e) => handleLoanChange(index, 'emiAmount', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Loan Age (months)</label>
                                        <input
                                            type="text"
                                            value={loan.loanAge}
                                            onChange={(e) => handleLoanChange(index, 'loanAge', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Interest Rate (%)</label>
                                        <input
                                            type="text"
                                            value={loan.interestRate}
                                            onChange={(e) => handleLoanChange(index, 'interestRate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                {userProfile.previousLoans.length > 1 && (
                                    <button 
                                        type="button" 
                                        className="remove-loan-button"
                                        onClick={() => handleRemoveLoan(index)}
                                    >
                                        Remove Loan
                                    </button>
                                )}
                            </div>
                        ))}
                        <button 
                            type="button" 
                            className="add-loan-button"
                            onClick={handleAddPreviousLoan}
                        >
                            Add Another Loan
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // Add the additional sections from Compare
    const renderAdditionalSections = () => {
        if (!isEditing) return null;
        
        return (
            <>
                <div className="profile-section financial-info">
                    <h2>Financial Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <DollarSign className="info-icon" />
                            <div>
                                <h3>Annual Income</h3>
                                <div className="input-with-prefix">
                                    <span className="prefix">₹</span>
                                    <input
                                        type="text"
                                        name="annualIncome"
                                        value={userProfile.annualIncome}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <Building className="info-icon" />
                            <div>
                                <h3>Employment Type</h3>
                                <select
                                    name="employmentType"
                                    value={userProfile.employmentType}
                                    onChange={handleChange}
                                >
                                    <option value="">Select...</option>
                                    <option value="Salaried">Salaried</option>
                                    <option value="Self-Employed">Self-Employed</option>
                                    <option value="Unemployed">Unemployed</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <Clock className="info-icon" />
                            <div>
                                <h3>Years in Current Job/Business</h3>
                                <input
                                    type="text"
                                    name="yearsInCurrentJob"
                                    value={userProfile.yearsInCurrentJob}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <MapPin className="info-icon" />
                            <div>
                                <h3>City/Region</h3>
                                <input
                                    type="text"
                                    name="cityRegion"
                                    value={userProfile.cityRegion}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                {renderLoanHistorySection()}
                
                <div className="profile-section credit-info">
                    <h2>Credit Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <AlertCircle className="info-icon" />
                            <div>
                                <h3>Have you ever been rejected for a loan?</h3>
                                <select
                                    name="loanRejectionHistory"
                                    value={userProfile.loanRejectionHistory}
                                    onChange={handleChange}
                                    className="select-styled"
                                >
                                    <option value="">Select an option</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="info-item">
                            <CreditCardIcon className="info-icon" />
                            <div>
                                <h3>Average Monthly Credit Card Usage</h3>
                                <div className="input-with-prefix">
                                    <span className="prefix">₹</span>
                                    <input
                                        type="text"
                                        name="avgCreditCardUsage"
                                        value={userProfile.avgCreditCardUsage}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="profile-container">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="profile-header">
                <div className="profile-avatar">
                    <User size={64} />
                </div>
                <h1>{userProfile.fullName || 'Complete Your Profile'}</h1>
                {!isFirstTimeUser && (
                <button 
                    className="edit-button"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
                )}
            </div>

            <div className="profile-content">
                <form onSubmit={handleUpdate}>
                <div className="profile-section personal-info">
                    <h2>Personal Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <User className="info-icon" />
                            <div>
                                <h3>Full Name</h3>
                                {isEditing ? (
                                    <input
                                        type="text"
                                            name="fullName"
                                        value={userProfile.fullName}
                                            onChange={handleChange}
                                    />
                                ) : (
                                    <p>{userProfile.fullName || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="info-item">
                            <Mail className="info-icon" />
                            <div>
                                <h3>Email</h3>
                                <p>{userProfile.email || 'Not provided'}</p>
                            </div>
                        </div>

                        <div className="info-item">
                            <Phone className="info-icon" />
                            <div>
                                <h3>Phone</h3>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                            name="phone"
                                        value={userProfile.phone}
                                            onChange={handleChange}
                                    />
                                ) : (
                                    <p>{userProfile.phone || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="info-item">
                            <MapPin className="info-icon" />
                            <div>
                                <h3>Address</h3>
                                {isEditing ? (
                                    <textarea
                                            name="address"
                                        value={userProfile.address}
                                            onChange={handleChange}
                                    />
                                ) : (
                                    <p>{userProfile.address || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="info-item">
                            <Calendar className="info-icon" />
                            <div>
                                <h3>Date of Birth</h3>
                                {isEditing ? (
                                    <input
                                        type="date"
                                            name="dateOfBirth"
                                        value={userProfile.dateOfBirth}
                                            onChange={handleChange}
                                    />
                                ) : (
                                    <p>{userProfile.dateOfBirth || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="info-item">
                                <Calendar className="info-icon" />
                            <div>
                                    <h3>Age</h3>
                                {isEditing ? (
                                        <input
                                            type="number"
                                            name="age"
                                            min="18"
                                            max="100"
                                            value={userProfile.age}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p>{userProfile.age || 'Not provided'}</p>
                                    )}
                    </div>
                </div>

                        <div className="info-item">
                            <CreditCard className="info-icon" />
                            <div>
                                <h3>PAN Card</h3>
                                {isEditing ? (
                                    <input
                                        type="text"
                                            name="panCard"
                                        value={userProfile.panCard}
                                            onChange={handleChange}
                                    />
                                ) : (
                                    <p>{userProfile.panCard || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                        <div className="info-item">
                            <Shield className="info-icon" />
                            <div>
                                <h3>Aadhar Number</h3>
                                {isEditing ? (
                                    <input
                                        type="text"
                                            name="aadharNumber"
                                        value={userProfile.aadharNumber}
                                            onChange={handleChange}
                                    />
                                ) : (
                                    <p>{userProfile.aadharNumber || 'Not provided'}</p>
                                )}
                            </div>
                        </div>

                            <div className="info-item">
                                <Briefcase className="info-icon" />
                                <div>
                                    <h3>Occupation</h3>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="occupation"
                                            value={userProfile.occupation}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <p>{userProfile.occupation || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Render additional sections from Compare if editing */}
                    {renderAdditionalSections()}
                    
                    {isEditing && (
                        <div className="profile-actions">
                        <button 
                                type="submit" 
                                className="save-button"
                                disabled={isSubmitting}
                        >
                                {isSubmitting 
                                    ? 'Saving...' 
                                    : (isFirstTimeUser ? 'Save and Continue' : 'Save Changes')
                                }
                        </button>
                    </div>
                )}
                </form>
            </div>
        </div>
    );
};

export default Profile; 