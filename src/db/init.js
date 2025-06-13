const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure the data directory exists
const dbDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'auth.db');
const db = new sqlite3.Database(dbPath);

// Create users table with all required fields and constraints
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(30) UNIQUE NOT NULL,
        display_name VARCHAR(30) NOT NULL,
        email VARCHAR(320) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        hash_algorithm VARCHAR(20) DEFAULT 'bcrypt',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
    )`);

  // Create case-insensitive unique indexes
  db.run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users(LOWER(username))`
  );
  db.run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email))`
  );

  // Create a table for common passwords blacklist
  db.run(`CREATE TABLE IF NOT EXISTS password_blacklist (
        password_hash VARCHAR(255) PRIMARY KEY
    )`);

  // Create a table for username blacklist
  db.run(`CREATE TABLE IF NOT EXISTS username_blacklist (
        username VARCHAR(30) PRIMARY KEY
    )`);

  // Insert some common reserved usernames
  const reservedUsernames = [
    'admin',
    'administrator',
    'root',
    'system',
    'support',
    'help',
    'info',
    'webmaster',
    'moderator',
    'staff',
  ];

  const stmt = db.prepare(
    'INSERT OR IGNORE INTO username_blacklist (username) VALUES (?)'
  );
  reservedUsernames.forEach(username => stmt.run(username.toLowerCase()));
  stmt.finalize();

  console.log('Database initialized successfully');
});

db.close();
