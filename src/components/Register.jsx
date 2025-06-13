import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../App';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Client-side validation functions
  const validateUsername = username => {
    const errors = [];

    if (!username) {
      errors.push('Username is required');
    } else if (username.length < 3 || username.length > 30) {
      errors.push('Username must be 3-30 characters long');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push(
        'Username can only contain letters, numbers, hyphens, and underscores'
      );
    } else if (/^[_-]|[_-]$/.test(username)) {
      errors.push('Username cannot start or end with special characters');
    } else if (/[_-]{2,}/.test(username)) {
      errors.push('Username cannot contain consecutive special characters');
    }

    return errors;
  };

  const validateEmail = email => {
    const errors = [];

    if (!email) {
      errors.push('Email address is required');
    } else if (email.length > 320) {
      errors.push('Email address must not exceed 320 characters');
    } else {
      const emailRegex = /^[a-zA-Z0-9.-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      } else if (email.includes('..')) {
        errors.push('Please enter a valid email address');
      } else {
        const [localPart, domainPart] = email.split('@');
        if (
          localPart.startsWith('.') ||
          localPart.endsWith('.') ||
          localPart.length > 64 ||
          !domainPart ||
          domainPart.startsWith('.') ||
          domainPart.endsWith('.')
        ) {
          errors.push('Please enter a valid email address');
        }
      }
    }

    return errors;
  };

  const validatePassword = password => {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    // Check for common passwords (basic client-side check)
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('This password is too common');
    }

    // Check against username and email
    if (
      formData.username &&
      password.toLowerCase() === formData.username.toLowerCase()
    ) {
      errors.push('Password cannot be the same as your username');
    }

    if (formData.email) {
      const emailLocal = formData.email.split('@')[0].toLowerCase();
      if (password.toLowerCase() === emailLocal) {
        errors.push('Password cannot be the same as your email');
      }
    }

    return errors;
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    const usernameErrors = validateUsername(formData.username);
    const emailErrors = validateEmail(formData.email);
    const passwordErrors = validatePassword(formData.password);

    const newErrors = {
      username: usernameErrors,
      email: emailErrors,
      password: passwordErrors,
    };

    // Check if there are any validation errors
    const hasErrors = Object.values(newErrors).some(
      errArray => errArray.length > 0
    );

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/auth/register', formData);

      if (response.data.success) {
        const { user, token } = response.data.data;
        login(user, token);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);

      if (error.response?.data?.errors) {
        // Handle server validation errors
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          if (!serverErrors[err.field]) {
            serverErrors[err.field] = [];
          }
          serverErrors[err.field].push(err.message);
        });
        setErrors(serverErrors);
      } else {
        setErrors({
          general: [
            error.response?.data?.message ||
              'Registration failed. Please try again.',
          ],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = field => {
    return errors[field]?.length > 0 ? errors[field][0] : '';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join us today and secure your digital presence</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-banner">{errors.general[0]}</div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={getFieldError('username') ? 'error' : ''}
              placeholder="Enter your username"
              required
            />
            {getFieldError('username') && (
              <span className="error-text">{getFieldError('username')}</span>
            )}
            <small className="field-hint">
              3-30 characters, letters, numbers, hyphens, and underscores only
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={getFieldError('email') ? 'error' : ''}
              placeholder="Enter your email address"
              required
            />
            {getFieldError('email') && (
              <span className="error-text">{getFieldError('email')}</span>
            )}
            <small className="field-hint">
              We'll never share your email with anyone else
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
                className={getFieldError('password') ? 'error' : ''}
                placeholder="Enter your password"
                required
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
            {getFieldError('password') && (
              <span className="error-text">{getFieldError('password')}</span>
            )}
            <small className="field-hint">
              At least 8 characters, avoid common passwords
            </small>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
