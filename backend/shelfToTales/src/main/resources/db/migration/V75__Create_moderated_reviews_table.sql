CREATE TABLE IF NOT EXISTS moderated_reviews (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    is_spoiler BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderated_reviews_book_id ON moderated_reviews (book_id);
CREATE INDEX IF NOT EXISTS idx_moderated_reviews_user_id ON moderated_reviews (user_id);
