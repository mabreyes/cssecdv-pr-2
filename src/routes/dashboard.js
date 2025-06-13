const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.join(__dirname, '..', '..', 'data', 'auth.db')
);

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.session.error = 'Please log in to access this page';
    return res.redirect('/login');
  }
  next();
};

// Dashboard page
router.get('/', requireAuth, async (req, res) => {
  try {
    // Get user's last login time
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT last_login FROM users WHERE id = ?',
        [req.session.user.id],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    res.render('dashboard', {
      user: {
        ...req.session.user,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    req.session.error = 'An error occurred while loading the dashboard';
    res.redirect('/login');
  }
});

module.exports = router;
