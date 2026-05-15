-- Seed additional books (IDs 4-10, continuing from V5 which seeded 1-3)
-- V7 already added pdf_url, preview_available, price columns
INSERT INTO books (id, title, author, isbn, description, cover_url, published_date, category_id, pdf_url, preview_available, price) VALUES
    (4,  '1984',                    'George Orwell',       '9780451524935', 'A dystopian novel set in a totalitarian society.',                     'https://covers.openlibrary.org/b/id/7222246-L.jpg', '1949-06-08', 1, 'https://sample-books.shelftotales.com/1984.pdf', TRUE, 10.99),
    (5,  'Dune',                    'Frank Herbert',       '9780441172719', 'A epic science fiction saga set on the desert planet Arrakis.',       'https://covers.openlibrary.org/b/id/6979861-L.jpg', '1965-08-01', 2, 'https://sample-books.shelftotales.com/dune.pdf', TRUE, 13.99),
    (6,  'Sapiens',                 'Yuval Noah Harari',   '9780062316097', 'A brief history of humankind from the Stone Age to the present.',     'https://covers.openlibrary.org/b/id/6520353-L.jpg', '2011-01-01', 3, 'https://sample-books.shelftotales.com/sapiens.pdf', TRUE, 15.99),
    (7,  'To Kill a Mockingbird',   'Harper Lee',          '9780061120084', 'A story of racial injustice in the American South.',                  'https://covers.openlibrary.org/b/id/7222246-L.jpg', '1960-07-11', 1, 'https://sample-books.shelftotales.com/mockingbird.pdf', TRUE, 11.99),
    (8,  'The Name of the Wind',    'Patrick Rothfuss',    '9780756404741', 'A young man grows to become the most famous wizard of his age.',      'https://covers.openlibrary.org/b/id/6979861-L.jpg', '2007-03-27', 2, 'https://sample-books.shelftotales.com/name-of-wind.pdf', TRUE, 9.99),
    (9,  'Cosmos',                  'Carl Sagan',          '9780345539434', 'A exploration of the universe and our place within it.',              'https://covers.openlibrary.org/b/id/6520353-L.jpg', '1980-10-01', 3, 'https://sample-books.shelftotales.com/cosmos.pdf', TRUE, 14.99),
    (10, 'Pride and Prejudice',     'Jane Austen',         '9780141439518', 'A classic romance novel about manners and marriage in Georgian England.','https://covers.openlibrary.org/b/id/7222246-L.jpg', '1813-01-28', 1, 'https://sample-books.shelftotales.com/pride.pdf', TRUE, 8.99);

SELECT setval(pg_get_serial_sequence('books', 'id'), 11, false);
