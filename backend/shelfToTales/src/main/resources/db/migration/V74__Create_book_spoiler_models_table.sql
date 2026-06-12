-- V74__Create_book_spoiler_models_table.sql
-- Tracks per-book fine-tuned spoiler detection models

CREATE TABLE book_spoiler_models (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL UNIQUE,
    ollama_model_name VARCHAR(128) NOT NULL,
    status          VARCHAR(24) NOT NULL DEFAULT 'NO_REVIEWS',
    training_example_count INTEGER,
    model_version   VARCHAR(32),
    last_trained_at TIMESTAMPTZ,
    gguf_drive_file_id VARCHAR(256),
    training_jsonl_path VARCHAR(512),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_spoiler_models_book
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX idx_book_spoiler_models_status ON book_spoiler_models(status);
CREATE INDEX idx_book_spoiler_models_book_id ON book_spoiler_models(book_id);
