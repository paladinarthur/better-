import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Car, GraduationCap, Wallet, Coins } from 'lucide-react';
import LoanCard from '../components/LoanCard';
import { fetchLoansByType, triggerScraper } from '../services/loanService';
import './LoanTypes.css';

interface LoanType {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    route: string;
}

const loanTypes: LoanType[] = [
    {
        id: 'home',
        name: 'Home Loan',
        description: 'Get the best rates for your dream home',
        icon: <Home size={48} />,
        route: '/loans/home'
    },
    {
        id: 'vehicle',
        name: 'Vehicle Loan',
        description: 'Drive home your dream car with our competitive rates',
        icon: <Car size={48} />,
        route: '/loans/car'
    },
    {
        id: 'student',
        name: 'Student Loan',
        description: 'Invest in your education with our student loan options',
        icon: <GraduationCap size={48} />,
        route: '/loans/student'
    },
    {
        id: 'personal',
        name: 'Personal Loan',
        description: 'Quick and easy personal loans for your needs',
        icon: <Wallet size={48} />,
        route: '/loans/personal'
    },
    {
        id: 'gold',
        name: 'Gold Loan',
        description: 'Get loans against your gold assets',
        icon: <Coins size={48} />,
        route: '/loans/gold'
    }
];

const LoanTypes: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedLoanType, setSelectedLoanType] = useState<string | null>(null);
    const [loanOffers, setLoanOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (location.pathname === '/loans') {
            setSelectedLoanType(null);
            setLoanOffers([]);
        }
    }, [location.pathname]);

    const handleLoanTypeClick = async (loanType: string) => {
        setSelectedLoanType(loanType);
        setLoading(true);
        setError(null);

        try {
            // First try to fetch existing data
            const data = await fetchLoansByType(loanType);
            
            if (!data || data.length === 0) {
                // If no data exists, trigger the scraper
                await triggerScraper(loanType);
                // Wait a moment for scraping to complete
                await new Promise(resolve => setTimeout(resolve, 5000));
                // Try fetching data again
                const freshData = await fetchLoansByType(loanType);
                setLoanOffers(freshData);
            } else {
                setLoanOffers(data);
            }
        } catch (err) {
            setError('Failed to fetch loan offers. Please try again later.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="loan-types-container">
            <div className="loan-types-header">
                <h1>Choose Your Loan Type</h1>
                <p>Select the type of loan you're interested in</p>
            </div>

            <div className="loan-types-grid">
                {loanTypes.map((loanType) => (
                    <div
                        key={loanType.id}
                        className={`loan-type-card ${selectedLoanType === loanType.id ? 'selected' : ''}`}
                        onClick={() => handleLoanTypeClick(loanType.id)}
                    >
                        <div className="loan-type-icon">
                            {loanType.icon}
                        </div>
                        <h2>{loanType.name}</h2>
                        <p>{loanType.description}</p>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="loading-spinner">
                    <p>Fetching latest loan offers...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {!loading && !error && loanOffers.length > 0 && (
                <div className="loan-offers-container">
                    <h2>Available {selectedLoanType?.charAt(0).toUpperCase()}{selectedLoanType?.slice(1)} Loans</h2>
                    <div className="loan-offers-grid">
                        {loanOffers.map((offer, index) => (
                            <LoanCard key={index} offer={offer} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoanTypes; 