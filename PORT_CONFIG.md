# Port Configuration Reference

## Development Mode (Local)

### Frontend (Vite Dev Server)
- **Port**: 5173
- **Host**: 0.0.0.0 (accessible externally)
- **URL**: http://localhost:5173
- **Command**: `npm run dev`

### Backend API
- **Port**: 5000
- **Host**: 0.0.0.0 (accessible externally)
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Command**: `npm run backend`

## Docker Mode (Production)

### Frontend (Nginx)
- **External Port**: 3000
- **Internal Port**: 80
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### Backend API
- **External Port**: 5000
- **Internal Port**: 5000
- **URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### Database (PostgreSQL)
- **External Port**: 5432
- **Internal Port**: 5432
- **Host**: localhost
- **Database**: auth_db
- **Username**: postgres
- **Password**: postgres123

### pgAdmin (Database Management)
- **External Port**: 8080
- **Internal Port**: 80
- **URL**: http://localhost:8080
- **Email**: admin@example.com
- **Password**: admin123

## Quick Start Commands

### Development
```bash
# Start both frontend and backend
npm run start:simple

# Start frontend only
npm run dev

# Start backend only
npm run backend

# Check health status
npm run health:check
```

### Docker
```bash
# Build and start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down

# Restart all services
npm run docker:restart
```

## Troubleshooting

### Port Already in Use
If you get port conflicts:
1. Check what's using the port: `lsof -i :5173` or `lsof -i :5000`
2. Kill the process: `kill -9 <PID>`
3. Or use alternative ports by modifying the commands

### Can't Access Services
1. **Check if service is running**: `curl http://localhost:5000/health`
2. **Check firewall settings**: Ensure ports are not blocked
3. **Check host binding**: Services are bound to 0.0.0.0 for external access
4. **Check Docker logs**: `npm run docker:logs`

### CORS Issues
The backend is configured to allow connections from:
- http://localhost:3000 (Docker frontend)
- http://localhost:5173 (Vite dev server)
- http://127.0.0.1:5173
- http://0.0.0.0:5173

## Network Access

All services are configured with `host: 0.0.0.0` which means:
- ✅ Accessible from localhost
- ✅ Accessible from local network (192.168.x.x)
- ✅ Accessible from Docker containers
- ✅ Accessible from external connections (if firewall allows) 