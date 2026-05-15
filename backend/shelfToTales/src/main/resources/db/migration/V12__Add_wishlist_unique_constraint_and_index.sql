ALTER TABLE wishlist_items ADD CONSTRAINT uq_wishlist_user_book UNIQUE (user_id, book_id);
CREATE INDEX idx_wishlist_user_id ON wishlist_items (user_id);
