ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL';

-- Set auth_provider for existing users
UPDATE users SET auth_provider = 'LOCAL' WHERE auth_provider IS NULL;

CREATE INDEX idx_users_google_id ON users (google_id);
