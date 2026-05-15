ALTER TABLE books ADD COLUMN pdf_url VARCHAR(500);
ALTER TABLE books ADD COLUMN preview_available BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE books ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00;

-- Seed PDF books
UPDATE books SET pdf_url = 'https://sample-books.shelftotales.com/great-gatsby.pdf', preview_available = TRUE, price = 12.99 WHERE isbn = '9780743273565';
UPDATE books SET pdf_url = 'https://sample-books.shelftotales.com/the-hobbit.pdf', preview_available = TRUE, price = 14.99 WHERE isbn = '9780547928227';
UPDATE books SET pdf_url = 'https://sample-books.shelftotales.com/brief-history-of-time.pdf', preview_available = TRUE, price = 11.99 WHERE isbn = '9780553380163';
