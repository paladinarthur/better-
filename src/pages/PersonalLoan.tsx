import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PersonalLoan.css';

const PersonalLoan: React.FC = () => {
    const navigate = useNavigate();
    
    // Redirect to BankCompare immediately when component mounts
    useEffect(() => {
        console.log('Redirecting from Personal Loan to Bank Compare page...');
        window.location.href = '/bankcompare'; // Use direct navigation for reliable redirect
    }, []);

    // Render loading screen during redirect
    return (
        <div className="personal-loan-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <h2>Redirecting to Bank Comparison Page...</h2>
            <p>Please wait while we redirect you to compare the best personal loan options.</p>
        </div>
    );
};

export default PersonalLoan; 