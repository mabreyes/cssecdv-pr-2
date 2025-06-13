# Secure Authentication System - CSSECDV Practical Exercise 2

A comprehensive secure authentication system demonstrating advanced security principles using React + Vite frontend and Node.js + Express backend.

## 🔐 Security Features Implemented

### A. User Registration System (55 points)

#### A1. Username Validation and Management (20 points)
- ✅ 3-30 character length enforcement
- ✅ Alphanumeric characters, underscores, and hyphens only
- ✅ Case-insensitive uniqueness checking
- ✅ Username blacklist (100+ reserved terms)
- ✅ No consecutive special characters
- ✅ No leading/trailing special characters
- ✅ Display name preservation with normalized storage

#### A2. Email Validation and Normalization (20 points)
- ✅ RFC 5321 compliance validation
- ✅ Local part validation (1-64 characters)
- ✅ Domain format validation
- ✅ 320 character maximum length
- ✅ Case normalization (lowercase storage)
- ✅ Comprehensive error messages
- ✅ Consecutive dots prevention

#### A3. Email Uniqueness Enforcement (10 points)
- ✅ Database-level unique constraints
- ✅ Case-insensitive uniqueness checking
- ✅ Proper error messaging
- ✅ Timing attack protection

#### A4. Input Sanitization and Security (5 points)
- ✅ XSS prevention
- ✅ SQL injection protection
- ✅ Input length validation
- ✅ Dangerous character filtering

### B. Password Security Implementation (45 points)

#### B1. Secure Password Hashing (25 points)
- ✅ bcrypt implementation with cost factor 12
- ✅ Unique salt per password
- ✅ Proper hash verification
- ✅ Consistent timing for security
- ✅ No plaintext password storage

#### B2. Password Strength Validation (15 points)
- ✅ 8-128 character length requirement
- ✅ 100+ common password blacklist
- ✅ Username/email similarity checking
- ✅ Sequential pattern detection
- ✅ Comprehensive validation rules

#### B3. Secure Database Storage (5 points)
- ✅ Hash-only storage (no plaintext)
- ✅ Secure schema design
- ✅ Proper field constraints
- ✅ No sensitive data in logs

### C. Bonus Features (20 points)

#### C1. Dual Login Support (10 points)
- ✅ Username or email authentication
- ✅ Automatic input type detection
- ✅ Case-insensitive matching
- ✅ Consistent security across both methods

#### C2. Generic Error Messages & Timing Protection (10 points)
- ✅ Identical error responses for all failures
- ✅ Consistent response timing
- ✅ User enumeration prevention
- ✅ Brute force protection

## 🛡️ Additional Security Measures

- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Secure cross-origin resource sharing
- **Helmet.js**: Security headers implementation
- **JWT Authentication**: Secure session management
- **Input Sanitization**: Multi-layer protection
- **HTTPS Ready**: Secure transmission support

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors
- **CSS3** - Modern responsive styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token management
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **morgan** - Request logging
- **cors** - Cross-origin resource sharing

### Database
- **SQLite** - Lightweight SQL database
- **sqlite3** - Node.js SQLite driver

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Start the Frontend Development Server

```bash
# In a new terminal, from the root directory
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🌐 API Endpoints

### Authentication Routes
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/logout` - Session termination
- `GET /auth/me` - Get current user info

### Protected Routes
- `GET /dashboard` - Protected dashboard content

### Utility Routes
- `GET /health` - Server health check

## 🧪 Security Test Cases

The system implements all test cases specified in the practical exercise:

### Username Validation Tests
- A1-1: Valid username acceptance
- A1-2: Mixed case normalization
- A1-3: Too short rejection
- A1-4: Too long rejection
- A1-5: Invalid characters rejection
- A1-6: Special character start/end rejection
- A1-7: Reserved username rejection
- A1-8: Case-insensitive duplicate rejection

### Email Validation Tests
- A2-1: Standard email acceptance
- A2-2: Subdomain support
- A2-3: Case normalization
- A2-4: Missing @ rejection
- A2-5: Consecutive dots rejection
- A2-6: Length limit enforcement
- A2-7: Empty field rejection
- A2-8: Missing domain rejection

### Security Tests
- A4-1: SQL injection prevention
- A4-2: XSS prevention
- A4-3: Input length validation
- B1-1 through B1-5: Password hashing tests
- B2-1 through B2-7: Password strength tests
- C1-1 through C1-5: Dual login tests
- C2-1 through C2-6: Timing protection tests

## 📱 User Interface

### Registration Page (`/register`)
- Comprehensive form validation
- Real-time error feedback
- Password visibility toggle
- Security hints and guidelines

### Login Page (`/login`)
- Dual authentication (username/email)
- Generic error messages
- Security notices
- Responsive design

### Dashboard (`/dashboard`)
- Protected content area
- User profile information
- Security status indicators
- Activity logging
- Logout functionality

## 🔒 Security Considerations

1. **Password Security**: bcrypt with cost factor 12, unique salts
2. **Session Management**: JWT with secure storage
3. **Input Validation**: Server-side validation with sanitization
4. **Error Handling**: Generic messages to prevent enumeration
5. **Rate Limiting**: Brute force protection
6. **CORS**: Configured for specific origins
7. **Headers**: Security headers via Helmet.js
8. **Logging**: No sensitive data in logs

## 🎯 Production Deployment

For production deployment:

1. Set environment variables:
   ```bash
   NODE_ENV=production
   JWT_SECRET=your-super-secure-secret
   FRONTEND_URL=https://yourdomain.com
   ```

2. Use HTTPS for all communications
3. Implement additional monitoring and alerting
4. Consider database encryption at rest
5. Set up proper backup strategies

## 📝 AI Assistance Disclosure

This project was developed with assistance from Claude Sonnet 4 AI for:
- Architecture and security best practices guidance
- Code structure and implementation patterns
- Comprehensive validation logic implementation
- Security testing methodology
- Documentation and explanation of security principles

All security implementations follow industry standards and the specific requirements outlined in the CSSECDV Practical Exercise 2 specification.

## 📄 License

This project is for educational purposes as part of DLSU CSSECDV coursework.

---

**Note**: This implementation demonstrates comprehensive security principles and should be adapted with additional security measures for production use.
