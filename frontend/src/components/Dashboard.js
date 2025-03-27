import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoanComparison from './LoanComparison';
import UserApplications from './UserApplications';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/applications' ? 'applications' : 'compare'
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'applications') {
      navigate('/applications');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Loan Comparison & Application System</h1>
        
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => handleTabChange('compare')}
          >
            Compare Loans
          </button>
          
          <button 
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => handleTabChange('applications')}
          >
            My Applications
          </button>
        </div>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'compare' && <LoanComparison />}
        {activeTab === 'applications' && <UserApplications />}
      </div>
    </div>
  );
};

export default Dashboard; 