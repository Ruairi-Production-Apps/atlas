-- Create store_orders table
CREATE TABLE store_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('province', 'county', 'group')),
  scope_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id), -- Nullable for guest checkout
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Payment Tracking
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status payment_status DEFAULT 'pending', -- Reusing existing enum
  
  -- Shipping/Delivery
  shipping_details JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create store_order_items table
CREATE TABLE store_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES store_products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL, -- Price at time of purchase
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_store_orders_scope ON store_orders(scope_type, scope_id);
CREATE INDEX idx_store_orders_user ON store_orders(user_id);
CREATE INDEX idx_store_orders_stripe_session ON store_orders(stripe_session_id);
CREATE INDEX idx_store_order_items_order ON store_order_items(order_id);

-- RLS Policies

ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;

-- Orders
-- 1. Create: Public can create orders (guest checkout)
CREATE POLICY "Public can create orders" ON store_orders
  FOR INSERT
  WITH CHECK (true);

-- 2. View: 
-- - Users can view their own orders
-- - Admins can view orders in their scope

CREATE POLICY "Users can view own orders" ON store_orders
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    -- Allow guest access via some token? For now strictly own user_id.
    -- Guests view success page via generic public route validation (e.g. session_id match)
    false
  );

CREATE POLICY "Admins can view scope orders" ON store_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.scope_type::text = store_orders.scope_type
      AND ur.scope_id = store_orders.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
  );



-- Order Items
-- Inherit access from parent order essentially
CREATE POLICY "Public can insert order items" ON store_order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_orders
      WHERE id = store_order_items.order_id
      -- In a real transaction, we verify ownership, but for Insert permissions, public is okay
    )
  );

CREATE POLICY "Users can view own order items" ON store_order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM store_orders
      WHERE id = store_order_items.order_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view scope order items" ON store_order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_orders
      WHERE id = store_order_items.order_id
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.scope_type::text = store_orders.scope_type
        AND ur.scope_id = store_orders.scope_id
        AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
      )
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_store_orders_modtime
    BEFORE UPDATE ON store_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
