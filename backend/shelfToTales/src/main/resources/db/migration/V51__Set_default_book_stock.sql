-- Set default stock for all books that have 0 stock
UPDATE books SET stock = 50 WHERE stock = 0 OR stock IS NULL;
