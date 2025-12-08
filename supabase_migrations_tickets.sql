-- Create Ticket Type Enum
DO $$ BEGIN
    CREATE TYPE ticket_type AS ENUM ('question', 'feature_request', 'bug_report', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Ticket Status Enum
DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM ('open', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type ticket_type NOT NULL DEFAULT 'question',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Ticket Replies Table
CREATE TABLE IF NOT EXISTS ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;

-- Tickets Policies

-- View: User sees own, Sysadmin sees all
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING ( auth.uid() = user_id );

CREATE POLICY "Sysadmins can view all tickets" ON tickets
    FOR SELECT USING ( is_sysadmin(auth.uid()) );

-- Insert: Users can insert own
CREATE POLICY "Users can create tickets" ON tickets
    FOR INSERT WITH CHECK ( auth.uid() = user_id );

-- Update: Sysadmins can update (status etc), Users can update (mark complete)
CREATE POLICY "Sysadmins can update tickets" ON tickets
    FOR UPDATE USING ( is_sysadmin(auth.uid()) );

CREATE POLICY "Users can update own tickets" ON tickets
    FOR UPDATE USING ( auth.uid() = user_id );

-- Ticket Replies Policies

-- View: User sees replies for own tickets, Sysadmin sees all
CREATE POLICY "Users can view replies for own tickets" ON ticket_replies
    FOR SELECT USING (
        EXISTS ( SELECT 1 FROM tickets WHERE id = ticket_id AND user_id = auth.uid() )
    );

CREATE POLICY "Sysadmins can view all replies" ON ticket_replies
    FOR SELECT USING ( is_sysadmin(auth.uid()) );

-- Insert: Users can reply to own tickets, Sysadmins can reply to any
CREATE POLICY "Users can reply to own tickets" ON ticket_replies
    FOR INSERT WITH CHECK (
        EXISTS ( SELECT 1 FROM tickets WHERE id = ticket_id AND user_id = auth.uid() )
        AND auth.uid() = user_id
    );

CREATE POLICY "Sysadmins can reply to tickets" ON ticket_replies
    FOR INSERT WITH CHECK ( is_sysadmin(auth.uid()) );
