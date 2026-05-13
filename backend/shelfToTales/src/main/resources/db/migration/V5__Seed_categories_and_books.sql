-- Seed categories
INSERT INTO categories (id, name, description) VALUES
    (1, 'Fiction', 'Imaginary stories'),
    (2, 'Fantasy', 'Magical worlds'),
    (3, 'Science', 'Non-fiction science');

-- Seed books (references category IDs above)
INSERT INTO books (id, title, author, isbn, description, cover_url, published_date, category_id) VALUES
    (1, 'The Great Gatsby',       'F. Scott Fitzgerald', '9780743273565', 'A story of wealth and love in the 1920s.',            'https://covers.openlibrary.org/b/id/7222246-L.jpg', '1925-04-10', 1),
    (2, 'The Hobbit',             'J.R.R. Tolkien',      '9780547928227', 'A hobbit journey to reclaim a treasure.',            'https://covers.openlibrary.org/b/id/6979861-L.jpg', '1937-09-21', 2),
    (3, 'A Brief History of Time','Stephen Hawking',     '9780553380163', 'Explaining cosmology to the general public.',        'https://covers.openlibrary.org/b/id/6520353-L.jpg', '1988-04-01', 3);

-- Reset ID sequences to continue from next value after seeded data
-- H2 syntax
ALTER TABLE categories ALTER COLUMN id RESTART WITH 4;
ALTER TABLE books ALTER COLUMN id RESTART WITH 4;
