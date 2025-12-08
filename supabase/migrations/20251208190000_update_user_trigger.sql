-- Update the handle_new_user function to handle first_name and last_name
-- and stop trying to insert into the dropped full_name column

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
  full_name_val TEXT;
BEGIN
  first_name_val := NEW.raw_user_meta_data->>'first_name';
  last_name_val := NEW.raw_user_meta_data->>'last_name';
  full_name_val := NEW.raw_user_meta_data->>'full_name';

  -- Fallback if first/last are missing but full_name exists (e.g. legacy or OAuth)
  IF first_name_val IS NULL AND last_name_val IS NULL AND full_name_val IS NOT NULL THEN
     first_name_val := split_part(full_name_val, ' ', 1);
     last_name_val := trim(substring(full_name_val from length(first_name_val) + 1));
     
     IF last_name_val = '' THEN
        last_name_val := NULL;
     END IF;
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(first_name_val, ''), -- Use empty string as fallback if absolutely nothing
    COALESCE(last_name_val, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
