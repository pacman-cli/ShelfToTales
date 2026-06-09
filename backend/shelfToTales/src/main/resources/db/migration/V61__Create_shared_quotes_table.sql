CREATE TABLE shared_quotes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    explanation TEXT,
    theme_style VARCHAR(100) NOT NULL DEFAULT 'sunset',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_shared_quotes_book ON shared_quotes(book_id);
CREATE INDEX idx_shared_quotes_user ON shared_quotes(user_id);
