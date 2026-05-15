-- Seed admin user (password: Admin123!)
-- BCrypt hash generated with 10 rounds
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) VALUES
    (1, 'admin@shelftotales.com', '$2b$10$HKbf5wibAl5gP9sSxbf1aurwwaWEpJOMvvSaN3feE51BXptP5fIqe', 'Admin User', 'ADMIN', NOW(), NOW());

-- Seed test user (password: User123!)
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) VALUES
    (2, 'user@shelftotales.com', '$2b$10$W2PDls4cvukyXKxcXU1.NecgvrbZzlsEOj8yRFnQEp1Sp5oE9dyF2', 'Test User', 'USER', NOW(), NOW());

-- Reset ID sequence (PostgreSQL)
SELECT setval(pg_get_serial_sequence('users', 'id'), 3, false);
