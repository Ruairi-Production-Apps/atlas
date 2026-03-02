-- Add payment and settings fields to event_forms table
-- This moves payment logic from events to forms

-- Payment fields
ALTER TABLE event_forms 
ADD COLUMN IF NOT EXISTS require_payment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_youth',
ADD COLUMN IF NOT EXISTS price_youth DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_scouter DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_group DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS price_fixed DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Settings fields  
ALTER TABLE event_forms
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Submit',
ADD COLUMN IF NOT EXISTS capacity_override INTEGER,
ADD COLUMN IF NOT EXISTS visibility_override TEXT;

-- Confirmations fields
ALTER TABLE event_forms
ADD COLUMN IF NOT EXISTS confirmation_message TEXT,
ADD COLUMN IF NOT EXISTS send_confirmation_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS send_admin_notification BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS redirect_url TEXT;

-- Add constraint for pricing_model
ALTER TABLE event_forms
ADD CONSTRAINT check_pricing_model 
CHECK (pricing_model IN ('per_youth', 'per_scouter', 'per_participant', 'per_group', 'fixed_price', 'free'));

-- Comments for documentation
COMMENT ON COLUMN event_forms.require_payment IS 'Whether this form requires payment to submit';
COMMENT ON COLUMN event_forms.pricing_model IS 'How pricing is calculated: per_youth, per_scouter, per_participant, per_group, fixed_price, or free';
COMMENT ON COLUMN event_forms.price_youth IS 'Price per youth member (used with per_youth and per_participant models)';
COMMENT ON COLUMN event_forms.price_scouter IS 'Price per scouter (used with per_scouter and per_participant models)';
COMMENT ON COLUMN event_forms.price_group IS 'Flat price per group (used with per_group model)';
COMMENT ON COLUMN event_forms.price_fixed IS 'Fixed price regardless of participants (used with fixed_price model)';
COMMENT ON COLUMN event_forms.payment_notes IS 'Internal admin notes about payment (not shown to public)';
COMMENT ON COLUMN event_forms.button_text IS 'Custom text for the form submit button';
COMMENT ON COLUMN event_forms.capacity_override IS 'Override event capacity for this specific form';
COMMENT ON COLUMN event_forms.visibility_override IS 'Override event visibility for this specific form';
COMMENT ON COLUMN event_forms.confirmation_message IS 'Message shown after successful form submission';
COMMENT ON COLUMN event_forms.send_confirmation_email IS 'Whether to send confirmation email to submitter';
COMMENT ON COLUMN event_forms.send_admin_notification IS 'Whether to notify admin of new submission';
COMMENT ON COLUMN event_forms.redirect_url IS 'Optional URL to redirect to after submission';
