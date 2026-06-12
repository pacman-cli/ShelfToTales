-- Add spam detection fields to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS spam_level VARCHAR(16) DEFAULT 'SAFE' NOT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS spam_score DECIMAL(4,3) DEFAULT 0 NOT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT FALSE NOT NULL;

-- Create spam_assessments table (mirrors spoiler_assessments pattern)
CREATE TABLE IF NOT EXISTS spam_assessments (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT,
    spam_level VARCHAR(16) NOT NULL,
    spam_score DECIMAL(4,3) NOT NULL,
    spam_reasons JSONB NOT NULL DEFAULT '[]',
    model VARCHAR(64) NOT NULL,
    latency_ms INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spam_assessments_review_id ON spam_assessments(review_id);
CREATE INDEX IF NOT EXISTS idx_reviews_spam_level ON reviews(spam_level);
