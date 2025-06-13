import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch dashboard data if user is authenticated and not in auth loading state
    if (isAuthenticated && !authLoading && user) {
      fetchDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      // If not authenticated and not loading, redirect to login
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token expired or invalid
        logout();
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if server call fails
    } finally {
      logout();
      navigate('/login');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Show loading if auth is still loading or dashboard data is loading
  if (authLoading || (isLoading && !error)) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{authLoading ? 'Verifying authentication...' : 'Loading your dashboard...'}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If not authenticated, this should be handled by ProtectedRoute, but just in case
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h1>Welcome, {user?.displayName || user?.username}!</h1>
            <p>🔐 Secure Dashboard</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* User Profile Card */}
          <div className="dashboard-card profile-card">
            <div className="card-header">
              <h2>👤 Profile Information</h2>
            </div>
            <div className="card-content">
              <div className="profile-field">
                <label>Display Name:</label>
                <span>{user?.displayName || 'Not set'}</span>
              </div>
              <div className="profile-field">
                <label>Username:</label>
                <span>{user?.username}</span>
              </div>
              <div className="profile-field">
                <label>Email:</label>
                <span>{user?.email}</span>
              </div>
              <div className="profile-field">
                <label>Account Created:</label>
                <span>{formatDate(user?.createdAt)}</span>
              </div>
              <div className="profile-field">
                <label>Last Login:</label>
                <span>{formatDate(user?.lastLogin)}</span>
              </div>
            </div>
          </div>

          {/* Security Status Card */}
          <div className="dashboard-card security-card">
            <div className="card-header">
              <h2>🛡️ Security Status</h2>
            </div>
            <div className="card-content">
              <div className="security-item">
                <div className="security-status good">
                  <span className="status-icon">✅</span>
                  <span>Password Securely Hashed</span>
                </div>
                <small>Your password is protected with bcrypt encryption</small>
              </div>
              <div className="security-item">
                <div className="security-status good">
                  <span className="status-icon">✅</span>
                  <span>JWT Authentication Active</span>
                </div>
                <small>Your session is secured with JSON Web Tokens</small>
              </div>
              <div className="security-item">
                <div className="security-status good">
                  <span className="status-icon">✅</span>
                  <span>HTTPS Connection</span>
                </div>
                <small>All data transmission is encrypted</small>
              </div>
              <div className="security-item">
                <div className="security-status good">
                  <span className="status-icon">✅</span>
                  <span>Rate Limiting Protection</span>
                </div>
                <small>Protected against brute force attacks</small>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="dashboard-card activity-card">
            <div className="card-header">
              <h2>📊 Recent Activity</h2>
            </div>
            <div className="card-content">
              <div className="activity-item">
                <div className="activity-icon">🔑</div>
                <div className="activity-details">
                  <div className="activity-title">Successful Login</div>
                  <div className="activity-time">{formatDate(dashboardData?.dashboardData?.lastLogin || user?.lastLogin)}</div>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🌐</div>
                <div className="activity-details">
                  <div className="activity-title">Dashboard Access</div>
                  <div className="activity-time">Just now</div>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message Card */}
          <div className="dashboard-card welcome-card">
            <div className="card-header">
              <h2>🎉 Welcome Message</h2>
            </div>
            <div className="card-content">
              <p className="welcome-message">
                {dashboardData?.dashboardData?.message || 
                 "You have successfully accessed the protected dashboard."}
              </p>
              <div className="achievement-badges">
                <span className="badge">🔐 Secure Login</span>
                <span className="badge">✅ Verified Account</span>
                <span className="badge">🛡️ Protected Session</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>
            <strong>Security Notice:</strong> This is a demonstration of secure authentication principles. 
            Your data is protected using industry-standard security practices including password hashing, 
            JWT tokens, input validation, and protection against common web vulnerabilities.
          </p>
          <div className="tech-stack">
            <small>Tech Stack: React + Vite • Node.js + Express • SQLite • bcrypt • JWT</small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 