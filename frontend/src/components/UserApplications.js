import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/applications/user/${userId}`);
        if (response.data.success) {
          setApplications(response.data.data);
        }
      } catch (error) {
        setError('Failed to fetch your applications');
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading your applications...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!userId) {
    return <div className="message">Please log in to view your applications</div>;
  }

  if (applications.length === 0) {
    return <div className="message">You haven't submitted any loan applications yet.</div>;
  }

  return (
    <div className="user-applications">
      <h2>Your Loan Applications</h2>
      
      <div className="applications-list">
        {applications.map(app => (
          <div key={app._id} className={`application-card status-${app.status}`}>
            <div className="application-header">
              <h3>{app.bankName} - {app.loanType}</h3>
              <div className="application-status">{app.status.replace('_', ' ')}</div>
            </div>
            
            <div className="application-details">
              <div className="detail">
                <span className="label">Amount:</span>
                <span className="value">₹{app.requestedAmount.toLocaleString()}</span>
              </div>
              
              <div className="detail">
                <span className="label">Tenure:</span>
                <span className="value">{app.requestedTenure} months</span>
              </div>
              
              <div className="detail">
                <span className="label">Applied on:</span>
                <span className="value">{new Date(app.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {app.aiAdvice && (
              <div className="ai-advice">
                <h4>Personalized Advice</h4>
                <p>{app.aiAdvice}</p>
              </div>
            )}
            
            {app.applicationNotes && (
              <div className="application-notes">
                <h4>Notes</h4>
                <p>{app.applicationNotes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserApplications; 