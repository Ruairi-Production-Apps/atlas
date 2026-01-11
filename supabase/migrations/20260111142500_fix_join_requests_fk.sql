-- Fix group_join_requests Foreign Key to point to public.profiles instead of auth.users
-- This allows PostgREST to properly join with the profiles table for non-superusers/system roles

DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'group_join_requests_user_id_fkey') THEN
    ALTER TABLE group_join_requests DROP CONSTRAINT group_join_requests_user_id_fkey;
  END IF;

  -- Add new constraint referencing profiles
  ALTER TABLE group_join_requests 
    ADD CONSTRAINT group_join_requests_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles(id) 
    ON DELETE CASCADE;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error updating constraint: %', SQLERRM;
END $$;

-- Grant permissions to authenticated users to allow group leaders to view/update requests
GRANT SELECT, UPDATE, DELETE ON group_join_requests TO authenticated;
GRANT SELECT, UPDATE, DELETE ON group_join_requests TO service_role;
