const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const {
  usernameValidation,
  emailValidation,
  passwordValidation,
  loginValidation,
  validate,
} = require('../middleware/validation');

const db = new sqlite3.Database(
  path.join(__dirname, '..', '..', 'data', 'auth.db')
);

// Helper function to create consistent timing for auth responses
const consistentTiming = callback => {
  const start = Date.now();
  return new Promise(resolve => {
    callback().then(result => {
      const elapsed = Date.now() - start;
      const minDelay = 500; // Minimum delay of 500ms
      if (elapsed < minDelay) {
        setTimeout(() => resolve(result), minDelay - elapsed);
      } else {
        resolve(result);
      }
    });
  });
};

// Registration page
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register');
});

// Registration handler
router.post(
  '/register',
  usernameValidation,
  emailValidation,
  passwordValidation,
  validate,
  async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Hash password with bcrypt (cost factor 12)
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Store user in database
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO users (username, display_name, email, password_hash) VALUES (?, ?, ?, ?)',
          [username.toLowerCase(), username, email.toLowerCase(), passwordHash],
          function (err) {
            if (err) reject(err);
            resolve(this.lastID);
          }
        );
      });

      req.session.success = 'Registration successful! Please log in.';
      res.redirect('/login');
    } catch (error) {
      console.error('Registration error:', error);
      req.session.error = 'An error occurred during registration';
      res.redirect('/register');
    }
  }
);

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login');
});

// Login handler with consistent timing
router.post('/login', loginValidation, validate, async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const result = await consistentTiming(async () => {
      // Try to find user by username or email (case-insensitive)
      const user = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?',
          [identifier.toLowerCase(), identifier.toLowerCase()],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!user) {
        return { success: false };
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return { success: false };
      }

      // Update last login
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id],
          err => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      return { success: true, user };
    });

    if (!result.success) {
      req.session.error = 'Invalid username/email or password';
      return res.redirect('/login');
    }

    // Set session
    req.session.user = {
      id: result.user.id,
      username: result.user.display_name,
      email: result.user.email,
    };

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    req.session.error = 'An error occurred during login';
    res.redirect('/login');
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
