-- Add stripe_session_id to payment schedules for tracking Checkout Sessions
ALTER TABLE membership_payment_schedules
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Add minimum payment amount setting to membership_configs
ALTER TABLE membership_configs
ADD COLUMN IF NOT EXISTS min_payment_amount NUMERIC(10, 2) DEFAULT 5.00;
