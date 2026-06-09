CREATE TABLE comparison_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_book_comparison UNIQUE (user_id, book_id)
);
CREATE INDEX idx_comparison_items_user ON comparison_items(user_id);
