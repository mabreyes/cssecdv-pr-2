#!/usr/bin/env node

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Secure Authentication System...\n');

// Check if backend dependencies are installed
const backendNodeModules = join(__dirname, 'backend', 'node_modules');
if (!existsSync(backendNodeModules)) {
  console.log('📦 Installing backend dependencies...');
  const install = spawn('npm', ['install'], { 
    cwd: join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true 
  });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Backend dependencies installed successfully\n');
      startServers();
    } else {
      console.error('❌ Failed to install backend dependencies');
      process.exit(1);
    }
  });
} else {
  startServers();
}

function startServers() {
  console.log('🔧 Starting both frontend and backend servers...\n');
  console.log('📋 Server Information:');
  console.log('   Frontend: http://localhost:5174 (if 5173 is busy)');
  console.log('   Backend:  http://localhost:5000');
  console.log('   Health:   http://localhost:5000/health\n');
  console.log('🛡️  Security Features:');
  console.log('   • Password hashing with bcrypt (cost factor 12)');
  console.log('   • JWT authentication with secure tokens');
  console.log('   • Rate limiting against brute force attacks');
  console.log('   • Input validation and sanitization');
  console.log('   • CORS protection and security headers');
  console.log('   • Generic error messages to prevent enumeration\n');
  console.log('📖 Usage:');
  console.log('   1. Register a new account at /register');
  console.log('   2. Login with username or email at /login');
  console.log('   3. Access the protected dashboard at /dashboard');
  console.log('   4. Use Ctrl+C to stop both servers\n');
  console.log('⚡ Starting servers now...\n');

  // Start both servers using concurrently
  const start = spawn('npx', ['concurrently', '"npm run backend"', '"npm run dev"'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    start.kill('SIGTERM');
    process.exit(0);
  });

  start.on('close', (code) => {
    console.log(`\n📊 Servers stopped with exit code ${code}`);
  });
} 