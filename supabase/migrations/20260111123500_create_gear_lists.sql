-- Create gear_lists table
CREATE TABLE IF NOT EXISTS gear_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    scope_type scope_type NOT NULL,
    scope_id UUID NOT NULL,
    author_id UUID NOT NULL REFERENCES auth.users(id),
    published BOOLEAN NOT NULL DEFAULT TRUE,
    share_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create gear_list_items table
CREATE TABLE IF NOT EXISTS gear_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gear_list_id UUID NOT NULL REFERENCES gear_lists(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    category TEXT,
    notes TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add gear_list_id to events table (one gear list can be used by many events)
ALTER TABLE events ADD COLUMN IF NOT EXISTS gear_list_id UUID REFERENCES gear_lists(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gear_lists_scope ON gear_lists(scope_type, scope_id);
CREATE INDEX IF NOT EXISTS idx_gear_lists_author ON gear_lists(author_id);
CREATE INDEX IF NOT EXISTS idx_gear_lists_share_token ON gear_lists(share_token);
CREATE INDEX IF NOT EXISTS idx_gear_lists_published ON gear_lists(published);
CREATE INDEX IF NOT EXISTS idx_events_gear_list ON events(gear_list_id) WHERE gear_list_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gear_list_items_list_id ON gear_list_items(gear_list_id);
CREATE INDEX IF NOT EXISTS idx_gear_list_items_display_order ON gear_list_items(gear_list_id, display_order);

-- Triggers for updated_at
CREATE TRIGGER set_gear_lists_updated_at
    BEFORE UPDATE ON gear_lists
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_gear_list_items_updated_at
    BEFORE UPDATE ON gear_list_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Enable RLS
ALTER TABLE gear_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE gear_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gear_lists

-- Public can view published gear lists via share token
CREATE POLICY "Public can view published gear lists"
    ON gear_lists
    FOR SELECT
    USING (published = true);

-- Authenticated users can view gear lists in their organizations
CREATE POLICY "Users can view org gear lists"
    ON gear_lists
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL AND (
            -- Sysadmin can view all
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- Users in the organization can view
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = gear_lists.scope_type
                AND scope_id = gear_lists.scope_id
            )
        )
    );

-- Org admins and scouters can create gear lists
CREATE POLICY "Org admins can create gear lists"
    ON gear_lists
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL AND (
            -- Sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- Org members with permissions
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = gear_lists.scope_type
                AND scope_id = gear_lists.scope_id
                AND (
                    (permissions->>'admin')::boolean = true
                    OR role IN ('scouter', 'group_leader')
                )
            )
        )
    );

-- Authors and org admins can update gear lists
CREATE POLICY "Authors and admins can update gear lists"
    ON gear_lists
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL AND (
            -- Sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- Author
            author_id = auth.uid()
            OR
            -- Org admins
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = gear_lists.scope_type
                AND scope_id = gear_lists.scope_id
                AND (permissions->>'admin')::boolean = true
            )
        )
    );

-- Authors and org admins can delete gear lists
CREATE POLICY "Authors and admins can delete gear lists"
    ON gear_lists
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL AND (
            -- Sysadmin
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND role = 'sysadmin'
            )
            OR
            -- Author
            author_id = auth.uid()
            OR
            -- Org admins
            EXISTS (
                SELECT 1 FROM user_roles
                WHERE user_id = auth.uid()
                AND scope_type = gear_lists.scope_type
                AND scope_id = gear_lists.scope_id
                AND (permissions->>'admin')::boolean = true
            )
        )
    );

-- RLS Policies for gear_list_items

-- Public can view items of published gear lists
CREATE POLICY "Public can view published gear list items"
    ON gear_list_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM gear_lists
            WHERE gear_lists.id = gear_list_items.gear_list_id
            AND gear_lists.published = true
        )
    );

-- Authenticated users can manage items if they can manage the parent list
CREATE POLICY "Users can manage items of their gear lists"
    ON gear_list_items
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
            -- Author of parent list
            EXISTS (
                SELECT 1 FROM gear_lists
                WHERE gear_lists.id = gear_list_items.gear_list_id
                AND gear_lists.author_id = auth.uid()
            )
            OR
            -- Org admin of parent list
            EXISTS (
                SELECT 1 FROM gear_lists
                JOIN user_roles ON user_roles.scope_type = gear_lists.scope_type 
                    AND user_roles.scope_id = gear_lists.scope_id
                WHERE gear_lists.id = gear_list_items.gear_list_id
                AND user_roles.user_id = auth.uid()
                AND (
                    (user_roles.permissions->>'admin')::boolean = true
                    OR user_roles.role IN ('scouter', 'group_leader')
                )
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
            -- Author of parent list
            EXISTS (
                SELECT 1 FROM gear_lists
                WHERE gear_lists.id = gear_list_items.gear_list_id
                AND gear_lists.author_id = auth.uid()
            )
            OR
            -- Org admin of parent list
            EXISTS (
                SELECT 1 FROM gear_lists
                JOIN user_roles ON user_roles.scope_type = gear_lists.scope_type 
                    AND user_roles.scope_id = gear_lists.scope_id
                WHERE gear_lists.id = gear_list_items.gear_list_id
                AND user_roles.user_id = auth.uid()
                AND (
                    (user_roles.permissions->>'admin')::boolean = true
                    OR user_roles.role IN ('scouter', 'group_leader')
                )
            )
        )
    );

-- Comments
COMMENT ON TABLE gear_lists IS 'Packing/equipment lists for events and camps, can be shared publicly and reused across multiple events';
COMMENT ON TABLE gear_list_items IS 'Individual items within a gear list';
COMMENT ON COLUMN gear_lists.share_token IS 'Unique token for public sharing URL';
COMMENT ON COLUMN events.gear_list_id IS 'Optional link to a reusable gear list - one list can be used by many events';
COMMENT ON COLUMN gear_list_items.display_order IS 'Order for displaying items, supports drag-and-drop reordering';
