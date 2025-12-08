-- Add new columns
ALTER TABLE profiles 
ADD COLUMN first_name text,
ADD COLUMN last_name text;

-- Migrate existing data
-- Split full_name by the first space found
UPDATE profiles
SET 
  first_name = split_part(full_name, ' ', 1),
  last_name = CASE 
    WHEN position(' ' in full_name) > 0 THEN substring(full_name from position(' ' in full_name) + 1)
    ELSE ''
  END;

-- Drop old column
ALTER TABLE profiles
DROP COLUMN full_name;
