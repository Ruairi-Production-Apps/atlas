-- Create user_saved_events table
CREATE TABLE IF NOT EXISTS public.user_saved_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- RLS Policies
ALTER TABLE public.user_saved_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_saved_events' AND policyname = 'Users can view their own saved events'
    ) THEN
        CREATE POLICY "Users can view their own saved events"
            ON public.user_saved_events FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_saved_events' AND policyname = 'Users can insert their own saved events'
    ) THEN
        CREATE POLICY "Users can insert their own saved events"
            ON public.user_saved_events FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_saved_events' AND policyname = 'Users can delete their own saved events'
    ) THEN
        CREATE POLICY "Users can delete their own saved events"
            ON public.user_saved_events FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_saved_events_user_id ON public.user_saved_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_events_event_id ON public.user_saved_events(event_id);
