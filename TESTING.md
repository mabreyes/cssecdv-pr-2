# Security Testing Guide

This guide helps you verify that all security features are working correctly according to the CSSECDV Practical Exercise 2 requirements.

## 🚀 Quick Start

1. **Install and Start**:
   ```bash
   npm run setup    # Install all dependencies
   npm start        # Start both servers
   ```

2. **Access the Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🧪 Manual Testing Scenarios

### A1. Username Validation Tests

#### ✅ Test A1-1: Valid Username
- Input: `validuser123`
- Expected: Username accepted, account created
- Verification: Check database contains lowercase `validuser123`

#### ✅ Test A1-2: Mixed Case Username
- Input: `TestUser`
- Expected: Username accepted, normalized to lowercase
- Verification: Database stores `testuser`, display shows `TestUser`

#### ❌ Test A1-3: Username Too Short
- Input: `ab`
- Expected: Registration rejected
- Error: "Username must be 3-30 characters long"

#### ❌ Test A1-4: Username Too Long
- Input: `verylongusernamethatexceedslimit`
- Expected: Registration rejected
- Error: "Username must be 3-30 characters long"

#### ❌ Test A1-5: Invalid Characters
- Input: `user@name`
- Expected: Registration rejected
- Error: "Username can only contain letters, numbers, hyphens, and underscores"

#### ❌ Test A1-6: Starting with Special Character
- Input: `_username`
- Expected: Registration rejected
- Error: "Username cannot start or end with special characters"

#### ❌ Test A1-7: Reserved Username
- Input: `admin`
- Expected: Registration rejected
- Error: "This username is not available"

#### ❌ Test A1-8: Duplicate Username (Case-Insensitive)
- Prerequisite: `existinguser` already exists
- Input: `ExistingUser`
- Expected: Registration rejected
- Error: "Username already exists"

### A2. Email Validation Tests

#### ✅ Test A2-1: Valid Email
- Input: `user@example.com`
- Expected: Email accepted, registration proceeds
- Verification: Email stored as `user@example.com`

#### ✅ Test A2-2: Email with Subdomain
- Input: `test.user@mail.domain.org`
- Expected: Email accepted
- Verification: Email stored as `test.user@mail.domain.org`

#### ✅ Test A2-3: Mixed Case Email
- Input: `TestUser@EXAMPLE.COM`
- Expected: Email accepted, normalized to lowercase
- Verification: Email stored as `testuser@example.com`

#### ❌ Test A2-4: Missing @ Symbol
- Input: `userexample.com`
- Expected: Registration rejected
- Error: "Please enter a valid email address"

#### ❌ Test A2-5: Consecutive Dots
- Input: `test..user@example.com`
- Expected: Registration rejected
- Error: "Please enter a valid email address"

#### ❌ Test A2-6: Email Too Long
- Input: 325-character email string
- Expected: Registration rejected
- Error: "Email address must not exceed 320 characters"

#### ❌ Test A2-7: Empty Email
- Input: `` (empty)
- Expected: Registration rejected
- Error: "Email address is required"

#### ❌ Test A2-8: Missing Domain
- Input: `user@`
- Expected: Registration rejected
- Error: "Please enter a valid email address"

### A3. Email Uniqueness Tests

#### ✅ Test A3-1: New Unique Email
- Input: `newuser@example.com`
- Expected: Registration successful
- Verification: Database contains exactly one record

#### ❌ Test A3-2: Duplicate Email (Exact)
- Prerequisite: `existing@example.com` already registered
- Input: `existing@example.com`
- Expected: Registration rejected
- Error: "An account with this email already exists"

#### ❌ Test A3-3: Duplicate Email (Different Case)
- Prerequisite: `existing@example.com` already registered
- Input: `EXISTING@EXAMPLE.COM`
- Expected: Registration rejected
- Error: "An account with this email already exists"

### A4. Input Sanitization Tests

#### 🛡️ Test A4-1: SQL Injection Prevention
- Input: `admin'; DROP TABLE users; --`
- Expected: Input properly escaped or rejected
- Verification: Database remains intact, no SQL execution

#### 🛡️ Test A4-2: XSS Prevention
- Input: `<script>alert('xss')</script>`
- Expected: Script tags escaped or rejected
- Verification: No script execution in browser

#### 🛡️ Test A4-3: Input Length Validation
- Input: 1000-character username
- Expected: Request rejected
- Error: Field length limits enforced

### B1. Password Hashing Tests

#### 🔐 Test B1-1: Secure Hash Generation
- Input: `SecurePassword123!`
- Expected: Hash generated with proper algorithm
- Verification: Database stores hash (not plaintext), bcrypt format

#### 🔐 Test B1-2: Unique Salt Per Password
- Input: Two accounts with `SamePassword123`
- Expected: Different hash values stored
- Verification: Hash comparison shows different values

#### 🔐 Test B1-3: Hash Algorithm Parameters
- Input: Any strong password
- Expected: Proper cost factor/parameters
- Verification: bcrypt shows `$2b$12$` prefix, proper timing

#### 🔐 Test B1-4: Password Verification
- Input: Correct password after registration
- Expected: Hash verification succeeds
- Verification: Authentication successful without plaintext comparison

### B2. Password Strength Tests

#### ❌ Test B2-1: Minimum Length
- Input: `Pass1`
- Expected: Registration rejected
- Error: "Password must be at least 8 characters long"

#### ❌ Test B2-2: Maximum Length
- Input: 150-character password
- Expected: Registration rejected
- Error: "Password must not exceed 128 characters"

#### ❌ Test B2-3: Common Password
- Input: `password`
- Expected: Registration rejected
- Error: "This password is too common"

#### ❌ Test B2-4: Username Similarity
- Username: `john`, Password: `john`
- Expected: Registration rejected
- Error: "Password cannot be the same as your username"

#### ❌ Test B2-5: Email Similarity
- Email: `john@example.com`, Password: `john`
- Expected: Registration rejected
- Error: "Password cannot be the same as your email"

#### ❌ Test B2-6: Sequential Pattern
- Input: `123456789`
- Expected: Registration rejected
- Error: "Password cannot contain sequential characters"

#### ✅ Test B2-7: Strong Password
- Input: `MyStr0ng#Passw0rd2025`
- Expected: Registration accepted
- Verification: Password meets all requirements

### C1. Dual Login Support Tests

#### 🔑 Test C1-1: Login with Username
- Prerequisite: User `testuser` exists
- Input: Username: `testuser`, Password: correct
- Expected: Login successful
- Verification: Authentication succeeds, session created

#### 🔑 Test C1-2: Login with Email
- Prerequisite: User with `test@example.com` exists
- Input: Email: `test@example.com`, Password: correct
- Expected: Login successful
- Verification: Authentication succeeds, session created

#### 🔑 Test C1-3: Username Case Insensitivity
- Prerequisite: User `TestUser` exists
- Input: Username: `testuser`, Password: correct
- Expected: Login successful
- Verification: Case-insensitive lookup works

#### 🔑 Test C1-4: Email Case Insensitivity
- Prerequisite: User with `Test@Example.com` exists
- Input: Email: `test@example.com`, Password: correct
- Expected: Login successful
- Verification: Case-insensitive lookup works

### C2. Generic Error Messages Tests

#### ⚠️ Test C2-1: Non-existent Username
- Input: Username: `nonexistent`, Password: `any`
- Expected: Generic error, consistent timing
- Error: "Invalid username/email or password"

#### ⚠️ Test C2-2: Non-existent Email
- Input: Email: `fake@example.com`, Password: `any`
- Expected: Identical response to C2-1
- Verification: Same error message and timing

#### ⚠️ Test C2-3: Valid Username, Wrong Password
- Input: Username: existing, Password: `wrong`
- Expected: Identical response pattern
- Verification: Same error format and timing

#### ⚠️ Test C2-4: Valid Email, Wrong Password
- Input: Email: existing, Password: `wrong`
- Expected: Identical response pattern
- Verification: Same error format and timing

## 🔒 Security Feature Verification

### Rate Limiting
1. Make 6+ rapid login attempts
2. Verify rate limiting kicks in
3. Check for 429 status code and appropriate message

### JWT Token Security
1. Login successfully
2. Check token format in browser storage
3. Verify token expiration
4. Test protected route access

### CORS Protection
1. Try accessing API from different origin
2. Verify CORS headers in response
3. Check preflight OPTIONS requests

### Input Sanitization
1. Try various injection payloads
2. Verify proper escaping/rejection
3. Check that dangerous content is neutralized

## 🎯 Automated Testing (Optional)

For automated testing, you can use tools like:
- **Postman** for API endpoint testing
- **OWASP ZAP** for security scanning
- **Burp Suite** for penetration testing
- **Jest/Supertest** for unit/integration tests

## 📊 Performance Testing

### Response Time Verification
1. Measure login response times
2. Verify consistent timing (within 50ms variance)
3. Test under load to ensure timing consistency

### Password Hashing Performance
1. Test registration with various password lengths
2. Verify bcrypt cost factor provides adequate protection
3. Ensure reasonable response times (< 500ms)

## 🔍 Database Verification

### Schema Verification
```sql
-- Check table structure
.schema users

-- Verify indexes exist
.indexes users

-- Check sample data (passwords should be hashed)
SELECT id, username, email, password_hash, created_at FROM users LIMIT 5;
```

### Security Verification
1. Confirm no plaintext passwords in database
2. Verify case-insensitive unique constraints
3. Check that all required fields are properly constrained

---

**Note**: This testing guide ensures comprehensive verification of all security requirements specified in CSSECDV Practical Exercise 2. 