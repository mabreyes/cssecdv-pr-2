# Secure Authentication System - CSSECDV Practical Exercise 2

A comprehensive secure authentication system built with React, Node.js, and PostgreSQL, demonstrating advanced security principles and best practices.

## 🔐 Key Security Features

- **Advanced User Registration**: Username/email validation, normalization, and blacklisting
- **Secure Password Management**: bcrypt hashing (cost factor 12), strength validation, common password blacklist
- **Dual Authentication**: Login with username or email
- **Attack Protection**: Rate limiting, timing attack prevention, SQL injection/XSS protection
- **JWT Authentication**: Secure session management with proper token handling

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services with Docker
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5001 (changed from 5000)
# pgAdmin: http://localhost:8080
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start backend (in one terminal)
cd backend && npm run dev

# Start frontend (in another terminal)
npm run dev
```

## 🛠️ Technology Stack

**Frontend**: React 18, Vite, React Router, Axios, CSS3  
**Backend**: Node.js, Express, bcrypt, JWT, express-validator, helmet  
**Database**: PostgreSQL (Docker) / SQLite (manual setup)  
**Security**: Rate limiting, CORS, input sanitization, security headers

## 🌐 API Endpoints

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | User registration   |
| POST   | `/auth/login`    | User authentication |
| POST   | `/auth/logout`   | Session termination |
| GET    | `/auth/me`       | Current user info   |
| GET    | `/dashboard`     | Protected content   |

## 🧪 Security Validation

The system implements comprehensive security measures tested against:

- Username validation (length, characters, uniqueness, blacklist)
- Email validation (RFC compliance, normalization, uniqueness)
- Password security (hashing, strength requirements, pattern detection)
- Input sanitization (SQL injection, XSS prevention)
- Authentication timing protection and generic error messages

## 📱 User Interface

- **Registration**: Real-time validation, password strength indicators
- **Login**: Dual authentication support (username/email)
- **Dashboard**: Protected user area with security status

## 🔒 Production Notes

For production deployment:

1. Set secure JWT_SECRET environment variable
2. Enable HTTPS
3. Configure proper CORS origins
4. Set up database encryption and backups
5. Implement monitoring and alerting

## 📋 Docker Services

| Service    | Port | Description         |
| ---------- | ---- | ------------------- |
| Frontend   | 3000 | React application   |
| Backend    | 5001 | Node.js API server  |
| PostgreSQL | 5432 | Database server     |
| pgAdmin    | 8080 | Database management |

**Default Credentials**:

- Database: `postgres` / `postgres123`
- pgAdmin: `admin@example.com` / `admin123`

---

**Educational Project**: Part of DLSU CSSECDV coursework demonstrating secure authentication implementation.
