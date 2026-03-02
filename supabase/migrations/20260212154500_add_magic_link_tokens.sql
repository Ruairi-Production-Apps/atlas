-- Add magic link tracking to membership registrations
ALTER TABLE membership_registrations 
ADD COLUMN IF NOT EXISTS magic_link_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS magic_link_expires_at TIMESTAMPTZ;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_membership_registrations_magic_link_token 
ON membership_registrations(magic_link_token);
