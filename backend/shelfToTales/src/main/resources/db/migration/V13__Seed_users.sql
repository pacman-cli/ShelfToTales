-- Seed admin user (password: Admin123!)
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) VALUES
    (1, 'admin@shelftotales.com', '$2a$10$PGD.UtKj0jwNlZzOEWNOhePhSttaGnzFTMgvBwdemV2Blui4rgUYa', 'Admin User', 'ADMIN', NOW(), NOW());

-- Seed test user (password: User123!)
INSERT INTO users (id, email, password, full_name, role, created_at, updated_at) VALUES
    (2, 'user@shelftotales.com', '$2a$10$Y1JLKQWL43//tJvCJBFEaejSSwvViq4ocCO53vmdqQCY0aMl6m5Ne', 'Test User', 'USER', NOW(), NOW());

-- Reset ID sequence (PostgreSQL)
SELECT setval(pg_get_serial_sequence('users', 'id'), 3, false);
