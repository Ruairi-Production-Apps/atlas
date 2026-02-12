-- Migration: Refine Membership RLS Policies
-- Date: 2026-02-07

-- 1. Drop old policies
DROP POLICY IF EXISTS "GL manage membership_configs" ON membership_configs;
DROP POLICY IF EXISTS "GL manage fee items" ON membership_fee_items;
DROP POLICY IF EXISTS "GL view all registrations" ON membership_registrations;
DROP POLICY IF EXISTS "GL manage schedules" ON membership_payment_schedules;

-- 2. Create refined policies using can_manage_scope helper
-- This automatically handles sysadmins and hierarchical permissions (county/province admins)

-- membership_configs
CREATE POLICY "Manage membership_configs" ON membership_configs
FOR ALL TO authenticated
USING (can_manage_scope(auth.uid(), 'group', group_id));

-- membership_fee_items
CREATE POLICY "Manage fee items" ON membership_fee_items
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_configs mc
    WHERE mc.id = membership_fee_items.config_id
    AND can_manage_scope(auth.uid(), 'group', mc.group_id)
  )
);

-- membership_registrations (Management view)
CREATE POLICY "Manage registrations" ON membership_registrations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_configs mc
    WHERE mc.id = membership_registrations.config_id
    AND can_manage_scope(auth.uid(), 'group', mc.group_id)
  )
);

-- membership_payment_schedules (Management view)
CREATE POLICY "Manage schedules" ON membership_payment_schedules
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_registrations mr
    INNER JOIN membership_configs mc ON mc.id = mr.config_id
    WHERE mr.id = membership_payment_schedules.registration_id
    AND can_manage_scope(auth.uid(), 'group', mc.group_id)
  )
);

-- 3. Add Scouter Role to can_manage_scope (Optional but good for completeness if not there)
-- The current can_manage_scope doesn't filter by role name if it's a direct match,
-- but the hierarchical ones check for specific roles like 'group_leader'.
-- Let's ensure scouters are also treated as capable of managing their group's membership if needed.
-- Actually, the current can_manage_scope implementation:
--   IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = $1 AND scope_type = $2 AND scope_id = $3) THEN RETURN true;
-- This means ANY role for that scope allows management for that specific scope.
-- So if someone is a 'scouter' for a group, they CAN manage it.
