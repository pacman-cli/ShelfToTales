-- Book chunks for retrieval-augmented generation (RAG).
-- The application splits book title/author/description/category/mood into
-- 200-token sliding-window chunks and stores a 384-dim embedding per chunk.
-- pgvector HNSW is created only when the extension is present (V55 logic);
-- the column is nullable so the table is usable without pgvector as well.
CREATE TABLE book_chunks (
    id BIGSERIAL PRIMARY KEY,
    book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (book_id, chunk_index)
);

CREATE INDEX idx_book_chunks_book_id ON book_chunks(book_id);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes WHERE indexname = 'book_chunks_embedding_idx'
        ) THEN
            CREATE INDEX book_chunks_embedding_idx
                ON book_chunks USING hnsw (embedding vector_cosine_ops);
        END IF;
    END IF;
END $$;
