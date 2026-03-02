-- Update handle_new_user to automatically create group join requests
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id UUID;
  v_requested_role TEXT;
BEGIN
  -- Insert into profiles
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Check for requested group
  IF NEW.raw_user_meta_data->>'requested_group_id' IS NOT NULL THEN
    BEGIN
      v_group_id := (NEW.raw_user_meta_data->>'requested_group_id')::UUID;
      
      -- Default validation role to parent if not specified (safest default)
      v_requested_role := COALESCE(NEW.raw_user_meta_data->>'invitation_role', 'parent');
      
      -- If role is not valid, fallback to parent
      IF v_requested_role NOT IN ('scouter', 'parent', 'both') THEN
        v_requested_role := 'parent';
      END IF;

      INSERT INTO group_join_requests (user_id, group_id, requested_role, status)
      VALUES (NEW.id, v_group_id, v_requested_role, 'pending')
      ON CONFLICT (user_id, group_id, status) DO NOTHING;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error or ignore to prevent blocking signup
      RAISE WARNING 'Failed to create join request for user %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
