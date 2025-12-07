-- Add payment tracking to form_submissions table

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Add payment columns to form_submissions
ALTER TABLE form_submissions
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT DEFAULT NULL;

-- Add webhook secret to organizational tables
ALTER TABLE provinces
ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;

ALTER TABLE counties
ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS stripe_webhook_secret TEXT;

-- Create indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_payment_status ON form_submissions(payment_status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_stripe_session ON form_submissions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_stripe_payment_intent ON form_submissions(stripe_payment_intent_id);

-- Add comments
COMMENT ON COLUMN form_submissions.payment_status IS 'Status of payment for this submission';
COMMENT ON COLUMN form_submissions.payment_amount IS 'Amount paid in euros';
COMMENT ON COLUMN form_submissions.stripe_session_id IS 'Stripe Checkout Session ID';
COMMENT ON COLUMN form_submissions.stripe_payment_intent_id IS 'Stripe Payment Intent ID';
