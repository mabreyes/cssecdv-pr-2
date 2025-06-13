const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.join(__dirname, '..', '..', 'data', 'auth.db')
);

// Username validation rules
const usernameValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters long')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      'Username can only contain letters, numbers, hyphens, and underscores'
    )
    .custom(async value => {
      // Check for consecutive special characters
      if (/([_-])\1/.test(value)) {
        throw new Error(
          'Username cannot contain consecutive special characters'
        );
      }
      // Check if starts or ends with special character
      if (/^[_-]|[_-]$/.test(value)) {
        throw new Error('Username cannot start or end with special characters');
      }
      // Check blacklist
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT 1 FROM username_blacklist WHERE username = ?',
          [value.toLowerCase()],
          (err, row) => {
            if (err) reject(err);
            if (row) reject(new Error('This username is not available'));
            resolve(true);
          }
        );
      });
    })
    .custom(async value => {
      // Check for existing username (case-insensitive)
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT 1 FROM users WHERE LOWER(username) = ?',
          [value.toLowerCase()],
          (err, row) => {
            if (err) reject(err);
            if (row) reject(new Error('Username already exists'));
            resolve(true);
          }
        );
      });
    }),
];

// Email validation rules
const emailValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .isLength({ max: 320 })
    .withMessage('Email address must not exceed 320 characters')
    .normalizeEmail()
    .custom(async value => {
      // Check for existing email (case-insensitive)
      return new Promise((resolve, reject) => {
        db.get(
          'SELECT 1 FROM users WHERE LOWER(email) = ?',
          [value.toLowerCase()],
          (err, row) => {
            if (err) reject(err);
            if (row)
              reject(new Error('An account with this email already exists'));
            resolve(true);
          }
        );
      });
    }),
];

// Password validation rules
const passwordValidation = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .custom(async (value, { req }) => {
      // Check for username similarity
      if (
        req.body.username &&
        value.toLowerCase().includes(req.body.username.toLowerCase())
      ) {
        throw new Error('Password cannot contain your username');
      }
      // Check for email similarity
      if (req.body.email) {
        const emailLocalPart = req.body.email.split('@')[0].toLowerCase();
        if (value.toLowerCase().includes(emailLocalPart)) {
          throw new Error('Password cannot contain your email');
        }
      }
      // Check for sequential patterns
      if (/(?:123|234|345|456|567|678|789|012)/.test(value)) {
        throw new Error('Password cannot contain sequential characters');
      }
      // Check common passwords (simplified for example)
      const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('This password is too common');
      }
      return true;
    }),
];

// Login validation
const loginValidation = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Validation result middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.error = errors.array()[0].msg;
    return res.redirect('back');
  }
  next();
};

module.exports = {
  usernameValidation,
  emailValidation,
  passwordValidation,
  loginValidation,
  validate,
};
