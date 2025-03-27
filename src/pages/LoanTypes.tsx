import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Car, GraduationCap, Wallet, Coins } from 'lucide-react';
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
    const navigate = useNavigate();

    const handleLoanTypeClick = (route: string) => {
        navigate(route);
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
                        className="loan-type-card"
                        onClick={() => handleLoanTypeClick(loanType.route)}
                    >
                        <div className="loan-type-icon">
                            {loanType.icon}
                        </div>
                        <h2>{loanType.name}</h2>
                        <p>{loanType.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoanTypes; 