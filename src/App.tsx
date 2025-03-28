import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Compare from './pages/Compare';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import HomeLoan from './pages/HomeLoan';
import CarLoan from './pages/CarLoan';
import GoldLoan from './pages/GoldLoan';
import LearnMore from './pages/LearnMore';
import LoanEligibility from './pages/LoanEligibility';
import CompareGuest from './pages/CompareGuest';
import CreditScore from './pages/CreditScore';
import LoanPreferences from './pages/LoanPreferences';
import LoanTypes from './pages/LoanTypes';
import StudentLoan from './pages/StudentLoan';
import PersonalLoan from './pages/PersonalLoan';

import BankCompare from './pages/BankCompare';

import './App.css';


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('token')));

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(Boolean(localStorage.getItem('token')));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
        <Router future={{ 
            v7_startTransition: true,
            v7_relativeSplatPath: true 
        }}>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/loans/*" element={<LoanTypes />} />
                    <Route path="/compare" element={
                        isAuthenticated ? <Compare /> : <CompareGuest />
                    } />
                    <Route path="/creditscore" element={<CreditScore />} />
                    <Route path="/loan-preferences" element={
                        <LoanPreferences 
                            onComplete={(data) => {
                                // This is just a placeholder function since the component
                                // already navigates to /loan-types in its handleSubmit
                                console.log('Loan preferences completed:', data);
                            }} 
                        />
                    } />
                    <Route path="/loan-types" element={<LoanTypes />} />
                    <Route path="/loans/student" element={<StudentLoan />} />
                    <Route path="/loans/personal" element={<PersonalLoan />} />
                    <Route 
                        path="/dashboard" 
                        element={
                            isAuthenticated ? 
                                <Dashboard /> : 
                                <Navigate to="/" />
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            isAuthenticated ? 
                                <Profile /> : 
                                <Navigate to="/" />
                        } 
                    />
                    <Route path="/loans/home" element={<HomeLoan />} />
                    <Route path="/loans/car" element={<CarLoan />} />
                    <Route path="/loans/gold" element={<GoldLoan />} />
                    <Route path="/about" element={<LearnMore />} />
                    <Route path="/loan-eligibility" element={<LoanEligibility />} />
                    <Route path="/bankcompare" element={<BankCompare />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;