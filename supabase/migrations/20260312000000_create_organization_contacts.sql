-- Create organization_contacts table
-- Stores key contacts (leaders, admins) displayed on organization public pages

CREATE TABLE IF NOT EXISTS organization_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    organization_type public.scope_type NOT NULL,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_org_contacts_org ON organization_contacts(organization_id, organization_type);

-- Trigger for updated_at
CREATE TRIGGER set_organization_contacts_updated_at
    BEFORE UPDATE ON organization_contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Enable RLS
ALTER TABLE organization_contacts ENABLE ROW LEVEL SECURITY;

-- Public can view contacts
CREATE POLICY "Public can view organization contacts"
    ON organization_contacts
    FOR SELECT
    USING (true);

-- Sysadmin can manage all
CREATE POLICY "Sysadmin can manage organization contacts"
    ON organization_contacts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'sysadmin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'sysadmin'
        )
    );

-- Org admins can manage their own org's contacts
CREATE POLICY "Org admins can manage their contacts"
    ON organization_contacts
    FOR ALL
    USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND scope_type = organization_contacts.organization_type
            AND scope_id = organization_contacts.organization_id
            AND role IN ('provincial_admin', 'county_admin', 'group_leader', 'team_admin')
        )
    )
    WITH CHECK (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND scope_type = organization_contacts.organization_type
            AND scope_id = organization_contacts.organization_id
            AND role IN ('provincial_admin', 'county_admin', 'group_leader', 'team_admin')
        )
    );
