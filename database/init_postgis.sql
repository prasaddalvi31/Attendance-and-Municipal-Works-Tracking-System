-- 1. Enable PostGIS for Spatial Data (Crucial for the GIS dashboard)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create Users Table (For Role-Based Access Control)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('worker', 'admin'))
);

-- 3. Create Audit Logs Table (Tamper-proof digital logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- PostGIS Geometry column to store the exact Point(Longitude, Latitude)
    location GEOMETRY(POINT, 4326), 
    
    photo_url TEXT,
    anomaly_flag INTEGER DEFAULT 0 CHECK (anomaly_flag IN (0, 1))
);

-- 4. Create Spatial Index
-- This makes querying locations for the web dashboard's map incredibly fast
CREATE INDEX idx_audit_logs_location ON audit_logs USING GIST (location);

-- 5. Insert a default Admin user to test the dashboard immediately
-- Note: 'pbkdf2:sha256...' is a placeholder. Use your Python backend to hash a real password.
INSERT INTO users (username, hashed_password, role) 
VALUES ('admin_super', 'pbkdf2:sha256$placeholder_hash_for_testing', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert a test worker
INSERT INTO users (username, hashed_password, role) 
VALUES ('worker_101', 'pbkdf2:sha256$placeholder_hash_for_testing', 'worker')
ON CONFLICT (username) DO NOTHING;