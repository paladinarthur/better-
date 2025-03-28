import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building2, LogIn, LogOut, Menu, X, User } from 'lucide-react';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    // Check if user is a first-time user
    const firstTimeFlag = localStorage.getItem('isFirstTimeUser');
    setIsFirstTimeUser(!!firstTimeFlag);
  }, [location.pathname]);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      localStorage.removeItem('isFirstTimeUser');
      setIsLoggedIn(false);
      setIsFirstTimeUser(false);
      navigate('/');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    setIsLoggedIn(true);
    
    // Check if user is a first-time user after login
    const firstTimeFlag = localStorage.getItem('isFirstTimeUser');
    setIsFirstTimeUser(!!firstTimeFlag);
    
    // If first time user, redirect to profile page
    if (firstTimeFlag) {
      navigate('/profile');
    } else {
      // Stay on the current page after login
      window.location.reload(); // This will refresh the current page
    }
  };

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    // If first-time user and not going to profile, prevent navigation
    if (isFirstTimeUser && path !== '/profile') {
      e.preventDefault();
      alert('Please complete your profile first before accessing other pages');
      navigate('/profile');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" onClick={handleNavigation('/')} className="nav-brand">
            <Building2 className="nav-icon" />
            <span>Better Banking</span>
          </Link>
        </div>

        <div className="nav-links desktop-menu">
          <Link to="/" onClick={handleNavigation('/')} className="nav-link">Home</Link>
          <div 
            className="nav-dropdown"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="nav-link">Loans</button>
            <div className={`dropdown-content ${showDropdown ? 'show' : ''}`}>
              <Link to="/loans/home" onClick={handleNavigation('/loans/home')} className="dropdown-item">Home Loans</Link>
              <Link to="/loans/car" onClick={handleNavigation('/loans/car')} className="dropdown-item">Car Loans</Link>
              <Link to="/loans/gold" onClick={handleNavigation('/loans/gold')} className="dropdown-item">Gold Loans</Link>
              <Link to="/loans/student" onClick={handleNavigation('/loans/student')} className="dropdown-item">Education Loans</Link>
              <Link to="/loans/personal" onClick={handleNavigation('/loans/personal')} className="dropdown-item">Personal Loans</Link>
            </div>
          </div>
          {isLoggedIn ? (
            <div className="auth-buttons">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Profile icon clicked, redirecting to profile page");
                  window.location.href = '/profile';
                }}
                className="profile-button"
              >
                <User className="button-icon" />
              </button>
              <button onClick={handleAuthClick} className="auth-button logout">
                <LogOut className="button-icon" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="login-button"
            >
              <LogIn className="button-icon" />
              Login
            </button>
          )}
        </div>

        <div className="mobile-menu">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="menu-button"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mobile-nav">
          <Link to="/" onClick={handleNavigation('/')} className="nav-link">Home</Link>
          <div 
            className="mobile-dropdown"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="nav-link">Loans</button>
            <div className={`mobile-dropdown-content ${showDropdown ? 'show' : ''}`}>
              <Link to="/loans/home" onClick={handleNavigation('/loans/home')} className="nav-link">Home Loans</Link>
              <Link to="/loans/car" onClick={handleNavigation('/loans/car')} className="nav-link">Car Loans</Link>
              <Link to="/loans/gold" onClick={handleNavigation('/loans/gold')} className="nav-link">Gold Loans</Link>
              <Link to="/loans/student" onClick={handleNavigation('/loans/student')} className="nav-link">Education Loans</Link>
              <Link to="/loans/personal" onClick={handleNavigation('/loans/personal')} className="nav-link">Personal Loans</Link>
            </div>
          </div>
          {isLoggedIn ? (
            <div className="auth-buttons">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Profile icon clicked, redirecting to profile page");
                  window.location.href = '/profile';
                }}
                className="profile-button"
              >
                <User className="button-icon" />
              </button>
              <button onClick={handleAuthClick} className="auth-button logout">
                <LogOut className="button-icon" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="login-button"
            >
              Login
            </button>
          )}
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
};

export default Navbar;