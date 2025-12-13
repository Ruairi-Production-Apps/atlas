-- Phase 2: Add configuration columns and field types for advanced fields

-- Add configuration column for address field
ALTER TABLE form_fields 
  ADD COLUMN IF NOT EXISTS address_config JSONB;

COMMENT ON COLUMN form_fields.address_config IS 'Address field configuration: which sub-fields to show (address1, address2, city, county, eircode) and their required status';

-- Add configuration for content fields
ALTER TABLE form_fields 
  ADD COLUMN IF NOT EXISTS content_config JSONB;

COMMENT ON COLUMN form_fields.content_config IS 'Content field configuration: heading level, paragraph text content, etc.';

-- Drop and recreate the field_type constraint with Phase 2 field types
ALTER TABLE form_fields DROP CONSTRAINT IF EXISTS form_fields_field_type_check;

ALTER TABLE form_fields ADD CONSTRAINT form_fields_field_type_check 
CHECK (field_type = ANY (ARRAY[
    -- Phase 1 fields
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
    'participants'::text,
    -- Phase 2 fields
    'address'::text,
    'heading'::text,
    'paragraph'::text,
    'section_break'::text
]));
