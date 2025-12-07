-- Add button_text column to event_forms
ALTER TABLE event_forms 
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Register Now';

-- Ensure description exists (just in case)
ALTER TABLE event_forms 
ADD COLUMN IF NOT EXISTS description TEXT;
