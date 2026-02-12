-- RLS policies for membership_reminders
-- Group leaders and sysadmins can manage reminders for their groups

CREATE POLICY "GL manage reminders" ON membership_reminders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM membership_configs mc
    INNER JOIN user_roles ur ON ur.scope_id = mc.group_id
    WHERE mc.id = membership_reminders.config_id
    AND ur.user_id = auth.uid()
    AND ur.role = 'group_leader'
    AND ur.scope_type = 'group'
  )
);

-- Sysadmins can manage all reminders
CREATE POLICY "Sysadmin manage reminders" ON membership_reminders
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'sysadmin'
  )
);
