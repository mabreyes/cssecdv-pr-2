const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('./database');

// JWT secret (in production, use environment variable)
const JWT_SECRET =
  process.env.JWT_SECRET ||
  'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h';

// Bcrypt cost factor (recommended: 12-14 for high security)
const BCRYPT_ROUNDS = 12;

// Timing delay to prevent timing attacks (constant time response)
const TIMING_DELAY_MS = 100;

// Helper function to add consistent timing delay
const addTimingDelay = async startTime => {
  const elapsed = Date.now() - startTime;
  const delay = Math.max(0, TIMING_DELAY_MS - elapsed);
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

// Generic error message for all authentication failures
const GENERIC_AUTH_ERROR = 'Invalid username/email or password';

// Register user
const registerUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const { username, email, password } = req.body;

    // Store original case for display, lowercase for storage/comparison
    const displayName = username;
    const normalizedUsername = username.toLowerCase();
    const normalizedEmail = email.toLowerCase();

    // Check if username already exists (case-insensitive)
    const existingUsername = await query(
      'SELECT id FROM users WHERE LOWER(username) = $1',
      [normalizedUsername]
    );

    if (existingUsername.rows.length > 0) {
      await addTimingDelay(startTime);
      return res.status(400).json({
        success: false,
        message: 'Registration failed',
        errors: [{ field: 'username', message: 'Username already exists' }],
      });
    }

    // Check if email already exists (case-insensitive)
    const existingEmail = await query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (existingEmail.rows.length > 0) {
      await addTimingDelay(startTime);
      return res.status(400).json({
        success: false,
        message: 'Registration failed',
        errors: [
          {
            field: 'email',
            message: 'An account with this email already exists',
          },
        ],
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert new user
    const result = await query(
      `INSERT INTO users (username, display_name, email, password_hash, hash_algorithm, created_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id`,
      [normalizedUsername, displayName, normalizedEmail, passwordHash, 'bcrypt']
    );

    const userId = result.rows[0].id;

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: userId,
        username: normalizedUsername,
        displayName: displayName,
        email: normalizedEmail,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await addTimingDelay(startTime);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          username: normalizedUsername,
          displayName: displayName,
          email: normalizedEmail,
        },
        token: token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    await addTimingDelay(startTime);

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

// Login user (supports both username and email)
const loginUser = async (req, res) => {
  const startTime = Date.now();

  try {
    const { identifier, password } = req.body;

    // Determine if identifier is email or username
    const isEmail = identifier.includes('@');
    const normalizedIdentifier = identifier.toLowerCase();

    // Query user by email or username (case-insensitive)
    const queryText = isEmail
      ? 'SELECT * FROM users WHERE LOWER(email) = $1'
      : 'SELECT * FROM users WHERE LOWER(username) = $1';

    const result = await query(queryText, [normalizedIdentifier]);
    const user = result.rows[0];

    // If user doesn't exist, still hash a dummy password to prevent timing attacks
    if (!user) {
      // Perform dummy hash operation to maintain consistent timing
      await bcrypt.hash('dummy-password', BCRYPT_ROUNDS);
      await addTimingDelay(startTime);

      return res.status(401).json({
        success: false,
        message: GENERIC_AUTH_ERROR,
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      await addTimingDelay(startTime);

      return res.status(401).json({
        success: false,
        message: GENERIC_AUTH_ERROR,
      });
    }

    // Update last login timestamp
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    await addTimingDelay(startTime);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          email: user.email,
          lastLogin: user.last_login,
        },
        token: token,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    await addTimingDelay(startTime);

    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = user;
    next();
  });
};

// Get current user info (protected route)
const getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, display_name, email, created_at, last_login FROM users WHERE id = $1',
      [req.user.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          email: user.email,
          createdAt: user.created_at,
          lastLogin: user.last_login,
        },
      },
    });
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Logout (client-side token removal, server-side could implement token blacklisting)
const logoutUser = (req, res) => {
  // In a production app, you might want to implement token blacklisting
  // For now, we'll just send a success response as logout is handled client-side
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};

module.exports = {
  registerUser,
  loginUser,
  authenticateToken,
  getCurrentUser,
  logoutUser,
  BCRYPT_ROUNDS,
  JWT_SECRET,
};
