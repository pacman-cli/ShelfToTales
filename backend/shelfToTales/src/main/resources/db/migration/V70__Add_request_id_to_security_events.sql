ALTER TABLE security_events ADD COLUMN request_id VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_security_events_request_id
    ON security_events(request_id)
    WHERE request_id IS NOT NULL;
