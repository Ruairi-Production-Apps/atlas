-- Add new ticket type
ALTER TYPE public.ticket_type ADD VALUE IF NOT EXISTS 'add_edit_organisation';

-- Create ticket attachments table
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for ticket_attachments
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view attachments for their own tickets
CREATE POLICY "Users can view own ticket attachments"
ON public.ticket_attachments
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.tickets
        WHERE tickets.id = ticket_attachments.ticket_id
        AND tickets.user_id = auth.uid()
    )
);

-- Policy: Admins/Scouters can view all ticket attachments (simplified for now, assumes admin checks happen elsewhere or via separate query policy)
-- Actually, let's keep it simple: view if you can view the ticket.
-- But standard users can view their own. Admins can view all.
-- We can reuse the ticket logic:
-- user_id = auth.uid() OR is_sysadmin() etc.

CREATE POLICY "Admins can view all ticket attachments"
ON public.ticket_attachments
FOR SELECT
USING (
    is_sysadmin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role IN ('provincial_admin', 'county_admin', 'team_admin') 
    )
);

-- Policy: Users can insert attachments for their own tickets (during creation mainly)
CREATE POLICY "Users can upload ticket attachments"
ON public.ticket_attachments
FOR INSERT
WITH CHECK (
    -- Allow if they own the ticket
    EXISTS (
        SELECT 1 FROM public.tickets
        WHERE tickets.id = ticket_attachments.ticket_id
        AND tickets.user_id = auth.uid()
    )
);

-- Storage Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Allow authenticated uploads
CREATE POLICY "Authenticated users can upload ticket attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'ticket-attachments' );

-- Allow public read (or authenticated read)
CREATE POLICY "Public can view ticket attachments"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'ticket-attachments' );
