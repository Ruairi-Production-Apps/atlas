-- Fix handle_new_user trigger to properly handle errors and match the current schema
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with proper error handling
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name', 
      split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1), 
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'last_name', 
      CASE 
        WHEN position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) > 0 
        THEN substring(COALESCE(NEW.raw_user_meta_data->>'full_name', '') from position(' ' in COALESCE(NEW.raw_user_meta_data->>'full_name', '')) + 1)
        ELSE ''
      END, 
      ''
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

  -- Also create a default "scouter" role for new users
  INSERT INTO user_roles (user_id, role, scope_type, scope_id)
  VALUES (NEW.id, 'scouter', 'system', NULL)
  ON CONFLICT (user_id, role, scope_type, scope_id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
