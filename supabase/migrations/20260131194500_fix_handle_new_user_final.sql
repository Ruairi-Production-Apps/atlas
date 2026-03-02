-- Fix handle_new_user function to correctly use first_name and last_name
-- And handle automatic group join requests

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id UUID;
  v_requested_role TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Extract names from metadata
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';

  -- Fallback if first/last are missing but full_name exists (e.g. legacy or OAuth)
  IF v_first_name IS NULL AND v_last_name IS NULL AND NEW.raw_user_meta_data->>'full_name' IS NOT NULL THEN
     v_first_name := split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1);
     v_last_name := trim(substring(NEW.raw_user_meta_data->>'full_name' from length(v_first_name) + 1));
     
     IF v_last_name = '' THEN
        v_last_name := NULL;
     END IF;
  END IF;

  -- Insert into profiles using explicit schema
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(v_first_name, ''),
    COALESCE(v_last_name, '')
  );

  -- Check for requested group
  IF NEW.raw_user_meta_data->>'requested_group_id' IS NOT NULL THEN
    BEGIN
      v_group_id := (NEW.raw_user_meta_data->>'requested_group_id')::UUID;
      
      -- Default validation role to parent if not specified
      v_requested_role := COALESCE(NEW.raw_user_meta_data->>'invitation_role', 'parent');
      
      -- If role is not valid, fallback to parent
      IF v_requested_role NOT IN ('scouter', 'parent', 'both') THEN
        v_requested_role := 'parent';
      END IF;

      -- Insert into group_join_requests using explicit schema
      INSERT INTO public.group_join_requests (user_id, group_id, requested_role, status)
      VALUES (NEW.id, v_group_id, v_requested_role, 'pending')
      ON CONFLICT (user_id, group_id, status) DO NOTHING;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error with explicit warning, but don't fail the transaction if join request fails
      RAISE WARNING 'Failed to create join request for user %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
