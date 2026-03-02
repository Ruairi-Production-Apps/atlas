-- Fix handle_new_user function to use explicit public schema references and proper search_path
-- This resolves "relation profiles does not exist" errors when the function runs in a restricted context

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_group_id UUID;
  v_requested_role TEXT;
BEGIN
  -- Insert into profiles using explicit schema
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
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
