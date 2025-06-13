-- PostgreSQL Database Initialization Script for Auth System
-- This script will run automatically when the container starts

-- Connect to the auth_db database
\c auth_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text extension for better performance
-- (Already available in PostgreSQL by default)

-- Set timezone
SET timezone = 'UTC';

-- Create application user (optional, for better security)
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'auth_app') THEN
--     CREATE ROLE auth_app WITH LOGIN PASSWORD 'auth_app_password';
--   END IF;
-- END
-- $$;

-- Grant necessary permissions
-- GRANT CONNECT ON DATABASE auth_db TO auth_app;
-- GRANT USAGE ON SCHEMA public TO auth_app;
-- GRANT CREATE ON SCHEMA public TO auth_app;

-- The tables will be created by the application on startup
-- This script is mainly for extensions and initial setup

-- Log completion
SELECT 'Database initialization completed at ' || NOW() as initialization_status; 