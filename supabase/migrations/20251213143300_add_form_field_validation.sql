-- Add description column to event_forms for internal notes
ALTER TABLE event_forms 
  ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN event_forms.description IS 'Internal description/notes for admin use only';

-- Add validation and configuration columns to form_fields
ALTER TABLE form_fields 
  ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS number_config JSONB,
  ADD COLUMN IF NOT EXISTS date_config JSONB;

-- Add index for faster validation rule queries
CREATE INDEX IF NOT EXISTS idx_form_fields_validation 
  ON form_fields USING gin(validation_rules);

COMMENT ON COLUMN form_fields.validation_rules IS 'Validation configuration: email regex, phone format, required patterns, etc.';
COMMENT ON COLUMN form_fields.number_config IS 'Number field configuration: min, max, step values';
COMMENT ON COLUMN form_fields.date_config IS 'Date/DateTime configuration: min_date, max_date, include_time flag';

-- Drop the old field_type constraint
ALTER TABLE form_fields DROP CONSTRAINT IF EXISTS form_fields_field_type_check;

-- Add new constraint with all field types including new ones
ALTER TABLE form_fields ADD CONSTRAINT form_fields_field_type_check 
CHECK (field_type = ANY (ARRAY[
    'short_text'::text, 
    'long_text'::text, 
    'email'::text,
    'phone'::text,
    'number'::text,
    'date'::text,
    'datetime'::text,
    'checkbox'::text,
    'select'::text, 
    'multi_select'::text, 
    'radio'::text, 
    'group'::text, 
    'participants'::text
]));
