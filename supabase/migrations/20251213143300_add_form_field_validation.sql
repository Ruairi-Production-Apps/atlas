-- Add validation and configuration columns to form_fields
ALTER TABLE form_fields 
  ADD COLUMN IF NOT EXISTS validation_rules JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS number_config JSONB, -- For number field: min, max, step
  ADD COLUMN IF NOT EXISTS date_config JSONB; -- For date/datetime: min_date, max_date, include_time

-- Add index for faster validation rule queries
CREATE INDEX IF NOT EXISTS idx_form_fields_validation 
  ON form_fields USING gin(validation_rules);

COMMENT ON COLUMN form_fields.validation_rules IS 'Validation configuration: email regex, phone format, required patterns, etc.';
COMMENT ON COLUMN form_fields.number_config IS 'Number field configuration: min, max, step values';
COMMENT ON COLUMN form_fields.date_config IS 'Date/DateTime configuration: min_date, max_date, include_time flag';
