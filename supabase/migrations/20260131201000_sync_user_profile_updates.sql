-- Create a function to handle syncing updates from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Extract names from metadata
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';

  -- Fallback logic similar to handle_new_user if first/last are missing but full_name exists
  IF v_first_name IS NULL AND v_last_name IS NULL AND NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
     v_first_name := split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1);
     v_last_name := trim(substring(NEW.raw_user_meta_data->>'full_name' from length(v_first_name) + 1));
     
     IF v_last_name = '' THEN
        v_last_name := NULL;
     END IF;
  END IF;

  -- Update the profile
  UPDATE public.profiles
  SET
    email = NEW.email,
    -- Only update names if they are present in the update
    first_name = COALESCE(v_first_name, profiles.first_name),
    last_name = COALESCE(v_last_name, profiles.last_name)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email OR OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION public.handle_update_user();
