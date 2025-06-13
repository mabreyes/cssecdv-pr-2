const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'auth_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: false, // Disable SSL for local development
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize database with the required schema
const initDatabase = async () => {
  try {
    const client = await pool.connect();

    console.log('Connected to PostgreSQL database');

    // Create users table with comprehensive security schema
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(30) NOT NULL,
        display_name VARCHAR(30) NOT NULL,
        email VARCHAR(320) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        hash_algorithm VARCHAR(20) DEFAULT 'bcrypt',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL
      )
    `;

    // Create case-insensitive unique indexes
    const createUsernameIndex = `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower 
      ON users(LOWER(username))
    `;

    const createEmailIndex = `
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower 
      ON users(LOWER(email))
    `;

    // Create update trigger for updated_at
    const createUpdateTrigger = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await client.query(createUsersTable);
    console.log('✅ Users table created successfully');

    await client.query(createUsernameIndex);
    console.log('✅ Username index created successfully');

    await client.query(createEmailIndex);
    console.log('✅ Email index created successfully');

    await client.query(createUpdateTrigger);
    console.log('✅ Update trigger created successfully');

    client.release();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

// Database query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', {
      text: text.substring(0, 50) + '...',
      duration,
      rows: res.rowCount,
    });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a client from the pool
const getClient = async () => {
  return await pool.connect();
};

// Close the database connection pool
const closePool = async () => {
  await pool.end();
  console.log('Database connection pool closed');
};

module.exports = {
  pool,
  query,
  getClient,
  initDatabase,
  closePool,
};
