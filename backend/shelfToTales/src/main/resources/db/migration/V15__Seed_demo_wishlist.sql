-- Seed demo wishlist entries for test user (user_id = 2, books 1, 4, 8)
INSERT INTO wishlist_items (id, user_id, book_id, added_at) VALUES
    (1, 2, 1,  NOW()),
    (2, 2, 4,  NOW()),
    (3, 2, 8,  NOW());

SELECT setval(pg_get_serial_sequence('wishlist_items', 'id'), 4, false);
