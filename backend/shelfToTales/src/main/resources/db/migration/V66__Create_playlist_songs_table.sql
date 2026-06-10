CREATE TABLE playlist_songs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    artist VARCHAR(200),
    file_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    duration_seconds INT,
    sort_order INT NOT NULL DEFAULT 0,
    added_by_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
