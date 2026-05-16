ALTER TABLE users ADD COLUMN name_overridden BOOLEAN NOT NULL DEFAULT FALSE;

-- Mark existing Google users as having overridden names (best-effort)
-- so their customized names are preserved on future Google logins
UPDATE users SET name_overridden = TRUE
WHERE auth_provider = 'GOOGLE'
  AND full_name IS NOT NULL
  AND full_name != '';
