
-- Migration to switch from per-org keys to Stripe Connect

-- Provinces
ALTER TABLE provinces
DROP COLUMN IF EXISTS stripe_public_key,
DROP COLUMN IF EXISTS stripe_private_key,
DROP COLUMN IF EXISTS stripe_webhook_secret,
DROP COLUMN IF EXISTS stripe_keys_validated,
DROP COLUMN IF EXISTS stripe_keys_validated_at;

ALTER TABLE provinces
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_details_submitted boolean DEFAULT false;

-- Counties
ALTER TABLE counties
DROP COLUMN IF EXISTS stripe_public_key,
DROP COLUMN IF EXISTS stripe_private_key,
DROP COLUMN IF EXISTS stripe_webhook_secret,
DROP COLUMN IF EXISTS stripe_keys_validated,
DROP COLUMN IF EXISTS stripe_keys_validated_at;

ALTER TABLE counties
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_details_submitted boolean DEFAULT false;

-- Groups
ALTER TABLE groups
DROP COLUMN IF EXISTS stripe_public_key,
DROP COLUMN IF EXISTS stripe_private_key,
DROP COLUMN IF EXISTS stripe_webhook_secret,
DROP COLUMN IF EXISTS stripe_keys_validated,
DROP COLUMN IF EXISTS stripe_keys_validated_at;

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_details_submitted boolean DEFAULT false;

-- Adventure Teams
ALTER TABLE adventure_teams
DROP COLUMN IF EXISTS stripe_public_key,
DROP COLUMN IF EXISTS stripe_private_key,
DROP COLUMN IF EXISTS stripe_webhook_secret,
DROP COLUMN IF EXISTS stripe_keys_validated,
DROP COLUMN IF EXISTS stripe_keys_validated_at;

ALTER TABLE adventure_teams
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_details_submitted boolean DEFAULT false;
