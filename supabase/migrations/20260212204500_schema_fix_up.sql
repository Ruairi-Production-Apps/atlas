-- Fix-up migration to resolve schema inconsistencies

-- 1. Ensure foreign key exists for registrations -> profiles join
-- This allows PostgREST to automatically join these tables in the public schema
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'membership_registrations_parent_id_profiles_fkey'
    ) THEN
        ALTER TABLE membership_registrations
        ADD CONSTRAINT membership_registrations_parent_id_profiles_fkey
        FOREIGN KEY (parent_id) REFERENCES profiles(id);
    END IF;
END $$;

-- 2. Ensure notifications table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- 3. Ensure indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_archived ON notifications(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- 4. Ensure RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own notifications') THEN
        CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own notifications') THEN
        CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can create notifications') THEN
        CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
