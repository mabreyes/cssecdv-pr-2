const { body, validationResult } = require('express-validator');

// Username blacklist - system reserved words and inappropriate terms
const USERNAME_BLACKLIST = [
  'admin', 'administrator', 'root', 'user', 'system', 'guest', 'test', 'demo',
  'support', 'help', 'api', 'www', 'mail', 'email', 'ftp', 'ssh', 'login',
  'signin', 'signup', 'register', 'auth', 'authentication', 'password', 'passwd',
  'null', 'undefined', 'void', 'delete', 'drop', 'select', 'insert', 'update',
  'create', 'alter', 'grant', 'revoke', 'exec', 'execute', 'script', 'eval',
  'function', 'class', 'object', 'array', 'string', 'number', 'boolean',
  'moderator', 'mod', 'operator', 'staff', 'superuser', 'su', 'sudo',
  'postmaster', 'webmaster', 'hostmaster', 'abuse', 'security', 'info',
  'service', 'daemon', 'bin', 'sys', 'config', 'settings', 'account',
  'profile', 'dashboard', 'home', 'index', 'main', 'default', 'public',
  'private', 'internal', 'external', 'local', 'remote', 'server', 'client',
  'database', 'db', 'sql', 'query', 'backup', 'restore', 'import', 'export',
  'file', 'folder', 'directory', 'path', 'url', 'uri', 'http', 'https',
  'tcp', 'udp', 'ip', 'dns', 'smtp', 'pop', 'imap', 'ssl', 'tls',
  'no-reply', 'noreply', 'donotreply', 'bounce', 'mailer-daemon',
  'contact', 'sales', 'marketing', 'billing', 'invoice', 'payment',
  'order', 'shop', 'store', 'cart', 'checkout', 'buy', 'sell',
  'news', 'blog', 'forum', 'community', 'social', 'media', 'press'
];

// Common weak passwords list
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
  'princess', 'login', 'solo', 'qwertyuiop', 'starwars', 'master',
  'shadow', 'iloveyou', 'michael', 'superman', 'batman', 'trustno1',
  'hello', 'freedom', 'whatever', 'nicole', 'jordan', 'cameron',
  'secret', 'summer', 'michelle', 'daniel', 'jessica', 'purple',
  'amanda', 'orange', 'jennifer', 'joshua', 'hunter', 'chelsea',
  'yellow', 'melissa', 'matthew', 'andrew', 'ashley', 'hannah',
  'password1', '123123', 'mustang', 'scooter', 'ginger', 'flower',
  'compaq', 'cowboy', 'martin', 'computer', 'maverick', 'cookie',
  'thunder', 'bird33', 'forest', 'chelsea1', 'chicken', 'wizard',
  'rabbit', 'enter', 'chevy', 'helpme', 'marlboro', 'johnson',
  'midnight', 'coffee', 'buster', 'hannah1', 'thomas', 'hockey',
  'shit', 'batman1', 'toyota', 'jordan1', 'prelude', 'mangoes',
  'spanky', 'mike', 'johnson1', 'secret1', 'rachel', 'qwert',
  'family', 'internet', 'service', 'school', 'love', 'god',
  'silver', 'diamond', 'metallic', 'zombie', 'swimming', 'dolphin',
  'dragons', 'paradise', 'mother', 'picture', 'money', 'goddess',
  'dancer', 'swimming', 'dolphin', 'harley', 'whatever1', 'boomer'
];

// Username validation
const validateUsername = () => {
  return [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3-30 characters long')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Username can only contain letters, numbers, hyphens, and underscores')
      .not()
      .matches(/^[_-]|[_-]$/)
      .withMessage('Username cannot start or end with special characters')
      .not()
      .matches(/[_-]{2,}/)
      .withMessage('Username cannot contain consecutive special characters')
      .custom((value) => {
        const lowerValue = value.toLowerCase();
        if (USERNAME_BLACKLIST.includes(lowerValue)) {
          throw new Error('This username is not available');
        }
        // Check for admin variations
        if (lowerValue.includes('admin') || lowerValue.includes('root') || lowerValue.includes('system')) {
          throw new Error('This username is not available');
        }
        return true;
      })
  ];
};

// Email validation with comprehensive RFC 5321 compliance
const validateEmail = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email address is required')
      .isLength({ max: 320 })
      .withMessage('Email address must not exceed 320 characters')
      .custom((value) => {
        // Custom RFC 5321 compliant email validation
        const emailRegex = /^[a-zA-Z0-9.-]{1,64}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!emailRegex.test(value)) {
          throw new Error('Please enter a valid email address');
        }

        // Check for consecutive dots
        if (value.includes('..')) {
          throw new Error('Please enter a valid email address');
        }

        // Check that local part doesn't start or end with dot
        const [localPart, domainPart] = value.split('@');
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
          throw new Error('Please enter a valid email address');
        }

        // Check local part length
        if (localPart.length > 64) {
          throw new Error('Please enter a valid email address');
        }

        // Ensure domain has proper format
        if (!domainPart || domainPart.length === 0 || domainPart.startsWith('.') || domainPart.endsWith('.')) {
          throw new Error('Please enter a valid email address');
        }

        return true;
      })
      .customSanitizer((value) => {
        // Normalize email to lowercase
        return value.toLowerCase();
      })
  ];
};

// Password strength validation
const validatePassword = () => {
  return [
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be at least 8 characters long')
      .custom((value, { req }) => {
        // Check maximum length
        if (value.length > 128) {
          throw new Error('Password must not exceed 128 characters');
        }

        // Check against common passwords
        if (COMMON_PASSWORDS.includes(value.toLowerCase())) {
          throw new Error('This password is too common');
        }

        // Check against username similarity
        if (req.body.username && value.toLowerCase() === req.body.username.toLowerCase()) {
          throw new Error('Password cannot be the same as your username');
        }

        // Check against email local part similarity
        if (req.body.email) {
          const emailLocal = req.body.email.split('@')[0].toLowerCase();
          if (value.toLowerCase() === emailLocal) {
            throw new Error('Password cannot be the same as your email');
          }
        }

        // Check for sequential patterns
        const sequentialPatterns = [
          '123456789', '987654321', 'abcdefghij', 'zyxwvutsrq',
          'qwertyuiop', 'poiuytrewq', 'asdfghjkl', 'lkjhgfdsa'
        ];
        
        for (let pattern of sequentialPatterns) {
          if (value.toLowerCase().includes(pattern)) {
            throw new Error('Password cannot contain sequential characters');
          }
        }

        return true;
      })
  ];
};

// Login identifier validation (username or email)
const validateLoginIdentifier = () => {
  return [
    body('identifier')
      .trim()
      .notEmpty()
      .withMessage('Username or email is required')
      .isLength({ max: 320 })
      .withMessage('Input too long')
      .custom((value) => {
        // Additional sanitization to prevent injection
        if (value.includes('<') || value.includes('>') || value.includes('&')) {
          throw new Error('Invalid characters in input');
        }
        return true;
      })
  ];
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      // Remove dangerous characters
      req.body[key] = req.body[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>]/g, '')
        .substring(0, 1000); // Limit input length
    }
  }
  next();
};

module.exports = {
  validateUsername,
  validateEmail,
  validatePassword,
  validateLoginIdentifier,
  handleValidationErrors,
  sanitizeInput,
  USERNAME_BLACKLIST,
  COMMON_PASSWORDS
}; 