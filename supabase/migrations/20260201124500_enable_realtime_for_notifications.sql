-- Enable Realtime for notifications and join requests
BEGIN;
  -- Ensure supabase_realtime publication exists (it usually does by default)
  -- But we specifically add our tables to it.
  
  DO $$
  BEGIN
    -- Add group_join_requests table to realtime
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'group_join_requests'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.group_join_requests;
    END IF;
  END $$;
COMMIT;
