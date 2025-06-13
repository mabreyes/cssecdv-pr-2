import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.general || errors[name]) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    // Basic client-side validation
    if (!formData.identifier) {
      setErrors({ identifier: 'Username or email is required' });
      setIsLoading(false);
      return;
    }
    
    if (!formData.password) {
      setErrors({ password: 'Password is required' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/login', formData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle all authentication errors with generic message
      // This prevents user enumeration attacks
      if (error.response?.status === 401) {
        setErrors({
          general: 'Invalid username/email or password'
        });
      } else if (error.response?.status === 429) {
        setErrors({
          general: 'Too many login attempts. Please try again later.'
        });
      } else {
        setErrors({
          general: 'Login failed. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if input looks like email for placeholder text
  const isEmailFormat = formData.identifier.includes('@');

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to access your secure dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleInputChange}
              className={errors.identifier ? 'error' : ''}
              placeholder="Enter your username or email"
              required
              autoComplete="username"
            />
            {errors.identifier && (
              <span className="error-text">{errors.identifier}</span>
            )}
            <small className="field-hint">
              {isEmailFormat 
                ? 'Logging in with email address'
                : 'You can use either your username or email address'
              }
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create Account
            </Link>
          </p>
        </div>
        
        <div className="security-notice">
          <small>
            🔒 Your connection is secure and encrypted. We protect your privacy and never store passwords in plain text.
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login; 