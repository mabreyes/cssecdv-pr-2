# 🐳 Docker Deployment Guide

This guide explains how to run the Secure Authentication System using Docker and Docker Compose with PostgreSQL database.

## 📋 Prerequisites

- **Docker Engine** 20.10+ installed
- **Docker Compose** v2.0+ installed
- At least 2GB RAM available
- Ports 3000, 5000, 5432, and 8080 available

## 🚀 Quick Start

### 1. Build and Start All Services

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432
- **pgAdmin**: http://localhost:8080

### 3. Default Credentials

**PostgreSQL Database:**

- Database: `auth_db`
- Username: `postgres`
- Password: `postgres123`

**pgAdmin Web Interface:**

- Email: `admin@example.com`
- Password: `admin123`

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   PostgreSQL    │
│   (React)       │    │   (Node.js)     │    │   Database      │
│   Port: 3000    │◄──►│   Port: 5000    │◄──►│   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    pgAdmin      │
                       │   Port: 8080    │
                       └─────────────────┘
```

## 🔧 Docker Services

### Frontend Service

- **Image**: Custom build from React + Vite
- **Web Server**: Nginx Alpine
- **Port**: 3000 → 80
- **Features**: Production optimized, gzipped assets

### Backend Service

- **Image**: Custom build from Node.js 18 Alpine
- **Port**: 5000
- **Features**: Non-root user, health checks, PostgreSQL integration

### Database Service

- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Features**: Persistent volumes, health checks, initialization scripts

### pgAdmin Service (Optional)

- **Image**: pgAdmin 4 latest
- **Port**: 8080
- **Features**: Web-based database management

## 🛠️ Development Commands

### Start Services

```bash
# Start all services
docker-compose up

# Start specific service
docker-compose up frontend
docker-compose up backend
docker-compose up postgres

# Start in background
docker-compose up -d
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove everything (including images)
docker-compose down --rmi all -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f backend
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build frontend
docker-compose build backend

# Force rebuild (no cache)
docker-compose build --no-cache
```

## 🔍 Health Checks

All services include health checks:

### Check Service Status

```bash
# View service health
docker-compose ps

# Check specific service health
docker inspect auth_backend --format='{{.State.Health.Status}}'
docker inspect auth_frontend --format='{{.State.Health.Status}}'
docker inspect auth_postgres --format='{{.State.Health.Status}}'
```

### Manual Health Check URLs

- Frontend: http://localhost:3000/health
- Backend: http://localhost:5000/health
- Database: `pg_isready -h localhost -p 5432 -U postgres`

## 🗄️ Database Management

### Connect to PostgreSQL

```bash
# Using docker exec
docker exec -it auth_postgres psql -U postgres -d auth_db

# Using local psql client
psql -h localhost -p 5432 -U postgres -d auth_db
```

### Database Operations

```sql
-- View all tables
\dt

-- View users table structure
\d users

-- View all users (passwords will be hashed)
SELECT id, username, display_name, email, created_at, last_login FROM users;

-- Check database size
SELECT pg_size_pretty(pg_database_size('auth_db'));
```

### Backup and Restore

```bash
# Create backup
docker exec auth_postgres pg_dump -U postgres auth_db > backup.sql

# Restore backup
docker exec -i auth_postgres psql -U postgres auth_db < backup.sql
```

## 🔒 Environment Variables

### Production Environment Variables

Create `.env` file in the root directory:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Application Configuration
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
FRONTEND_URL=http://localhost:3000

# PostgreSQL Configuration
POSTGRES_DB=auth_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password

# pgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@yourdomain.com
PGADMIN_DEFAULT_PASSWORD=your-secure-password
```

### Load Environment File

```bash
# Use environment file
docker-compose --env-file .env up
```

## 📊 Monitoring and Debugging

### Container Resource Usage

```bash
# View resource usage
docker stats

# View specific container stats
docker stats auth_backend auth_frontend auth_postgres
```

### Debug Container Issues

```bash
# Execute shell in running container
docker exec -it auth_backend sh
docker exec -it auth_frontend sh
docker exec -it auth_postgres bash

# View container details
docker inspect auth_backend
docker logs auth_backend --tail 50
```

### Network Debugging

```bash
# List networks
docker network ls

# Inspect auth network
docker network inspect auth_network

# Test connectivity between containers
docker exec auth_backend ping postgres
docker exec auth_frontend ping backend
```

## 🚀 Production Deployment

### 1. Security Hardening

```bash
# Use production environment
export NODE_ENV=production

# Set secure passwords
export DB_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 48)
export PGADMIN_DEFAULT_PASSWORD=$(openssl rand -base64 16)
```

### 2. Reverse Proxy Setup

Use nginx or Traefik for:

- SSL termination
- Load balancing
- Rate limiting
- Static asset serving

### 3. Resource Limits

Update `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          memory: 256M
```

### 4. Data Persistence

Ensure volumes are backed up:

```bash
# Backup volume
docker run --rm -v auth_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_backup.tar.gz /data
```

## 🧪 Testing with Docker

### Run Tests in Container

```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test
```

### Integration Testing

```bash
# Test API endpoints
curl http://localhost:5000/health
curl http://localhost:3000/health

# Test database connection
docker-compose exec postgres pg_isready -U postgres
```

## 🔧 Troubleshooting

### Common Issues

**Port Already in Use:**

```bash
# Find process using port
lsof -i :3000
lsof -i :5000
lsof -i :5432

# Change ports in docker-compose.yml
```

**Database Connection Failed:**

```bash
# Check database logs
docker-compose logs postgres

# Verify database is ready
docker-compose exec postgres pg_isready -U postgres
```

**Frontend Build Failed:**

```bash
# Clear npm cache
docker-compose build --no-cache frontend

# Check build logs
docker-compose logs frontend
```

**Permission Denied:**

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Reset Everything

```bash
# Complete reset (WARNING: This will delete all data)
docker-compose down -v --rmi all
docker system prune -af
docker volume prune -f
```

## 📈 Performance Optimization

### 1. Multi-stage Builds

Already implemented in Dockerfiles for minimal image sizes.

### 2. Layer Caching

- Dependencies installed before copying source code
- Use `.dockerignore` to exclude unnecessary files

### 3. Resource Monitoring

```bash
# Monitor container performance
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

---

**Note**: This Docker setup is production-ready but should be further hardened for production environments with proper secrets management, monitoring, and backup strategies.
