-- Add Stripe key validation tracking to organizational tables

-- Add columns to provinces table
ALTER TABLE provinces
ADD COLUMN IF NOT EXISTS stripe_public_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_private_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_keys_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_keys_validated_at TIMESTAMPTZ;

-- Add columns to counties table
ALTER TABLE counties
ADD COLUMN IF NOT EXISTS stripe_public_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_private_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_keys_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_keys_validated_at TIMESTAMPTZ;

-- Add columns to groups table
ALTER TABLE groups
ADD COLUMN IF NOT EXISTS stripe_public_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_private_key TEXT,
ADD COLUMN IF NOT EXISTS stripe_keys_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_keys_validated_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provinces_stripe_validated ON provinces(stripe_keys_validated);
CREATE INDEX IF NOT EXISTS idx_counties_stripe_validated ON counties(stripe_keys_validated);
CREATE INDEX IF NOT EXISTS idx_groups_stripe_validated ON groups(stripe_keys_validated);

-- Add comment for documentation
COMMENT ON COLUMN provinces.stripe_keys_validated IS 'Indicates whether the Stripe API keys have been validated';
COMMENT ON COLUMN counties.stripe_keys_validated IS 'Indicates whether the Stripe API keys have been validated';
COMMENT ON COLUMN groups.stripe_keys_validated IS 'Indicates whether the Stripe API keys have been validated';
