-- Allow admins to update orders in their scope (e.g. mark as shipped)
DROP POLICY IF EXISTS "Admins can update scope orders" ON store_orders;

CREATE POLICY "Admins can update scope orders" ON store_orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.scope_type::text = store_orders.scope_type
      AND ur.scope_id = store_orders.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.scope_type::text = store_orders.scope_type
      AND ur.scope_id = store_orders.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
  );
