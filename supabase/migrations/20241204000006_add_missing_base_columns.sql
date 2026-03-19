-- Catch-up migration: adds columns that exist in production but were not in original CREATE TABLE migrations.
-- Uses IF NOT EXISTS so it's safe to run on production (columns already exist there).

-- provinces, counties, groups: banking/payment fields
ALTER TABLE provinces
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS bic TEXT,
  ADD COLUMN IF NOT EXISTS account_name TEXT;

ALTER TABLE counties
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS bic TEXT,
  ADD COLUMN IF NOT EXISTS account_name TEXT;

ALTER TABLE groups
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS bic TEXT,
  ADD COLUMN IF NOT EXISTS account_name TEXT;

-- events: payment and section type fields
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS selected_section_types TEXT;

-- news_posts: description field
ALTER TABLE news_posts
  ADD COLUMN IF NOT EXISTS description TEXT;

