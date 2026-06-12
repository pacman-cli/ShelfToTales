-- Spoiler classification: per-review assessment with sentence-level detail.
CREATE TABLE spoiler_assessments (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL UNIQUE REFERENCES reviews(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    spoiler_level VARCHAR(16) NOT NULL CHECK (spoiler_level IN ('SAFE','MINOR_SPOILER','MAJOR_SPOILER')),
    spoiler_score NUMERIC(4,3) NOT NULL,
    spoiler_sentences JSONB NOT NULL DEFAULT '[]'::jsonb,
    sanitized_review TEXT,
    model VARCHAR(64) NOT NULL,
    latency_ms INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_spoiler_assessments_level ON spoiler_assessments(spoiler_level);
CREATE INDEX idx_spoiler_assessments_user_id ON spoiler_assessments(user_id);

-- Review-level spoiler level (server-derived; legacy is_spoiler boolean preserved for back-compat).
ALTER TABLE reviews ADD COLUMN spoiler_level VARCHAR(16);
UPDATE reviews SET spoiler_level = CASE WHEN is_spoiler THEN 'MAJOR_SPOILER' ELSE 'SAFE' END WHERE spoiler_level IS NULL;
ALTER TABLE reviews ALTER COLUMN spoiler_level SET NOT NULL;
ALTER TABLE reviews ADD CONSTRAINT reviews_spoiler_level_check
    CHECK (spoiler_level IN ('SAFE','MINOR_SPOILER','MAJOR_SPOILER'));
CREATE INDEX idx_reviews_spoiler_level ON reviews(spoiler_level);
