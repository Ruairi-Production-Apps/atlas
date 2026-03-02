-- Create event_key_contacts table
-- Allows setting a primary contact person for each event

CREATE TABLE IF NOT EXISTS event_key_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_event_key_contacts_event_id ON event_key_contacts(event_id);
CREATE INDEX IF NOT EXISTS idx_event_key_contacts_user_id ON event_key_contacts(user_id);

-- Trigger for updated_at
CREATE TRIGGER set_event_key_contacts_updated_at
    BEFORE UPDATE ON event_key_contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Enable RLS
ALTER TABLE event_key_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view key contacts for published events
CREATE POLICY "Public can view key contacts for published events"
    ON event_key_contacts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM events
            WHERE events.id = event_key_contacts.event_id
            AND events.published = true
        )
    );

-- Authenticated users with org permissions can manage
CREATE POLICY "Org admins can manage key contacts"
    ON event_key_contacts
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND (
            -- Sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- Organization admin for the event's organization
            EXISTS (
                SELECT 1 FROM events e
                JOIN user_roles ur ON ur.scope_type = e.scope_type AND ur.scope_id = e.scope_id
                WHERE e.id = event_key_contacts.event_id
                AND ur.user_id = auth.uid()
                AND (ur.permissions->>'admin')::boolean = true
            )
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- Sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- Organization admin
            EXISTS (
                SELECT 1 FROM events e
                JOIN user_roles ur ON ur.scope_type = e.scope_type AND ur.scope_id = e.scope_id
                WHERE e.id = event_key_contacts.event_id
                AND ur.user_id = auth.uid()
                AND (ur.permissions->>'admin')::boolean = true
            )
        )
    );

-- Comment
COMMENT ON TABLE event_key_contacts IS 'Stores the primary contact person for each event, displayed as Event Organiser Info on public pages';
