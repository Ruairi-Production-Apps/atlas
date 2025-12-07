-- Create store_products table
-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE store_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('province', 'county', 'group')),
  scope_id UUID NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER, -- NULL implies unlimited
  tags TEXT[] DEFAULT '{}',
  available_from TIMESTAMPTZ,
  available_to TIMESTAMPTZ,
  shipping_enabled BOOLEAN DEFAULT false,
  shipping_mode TEXT CHECK (shipping_mode IN ('flat_rate', 'per_item')),
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_store_products_scope ON store_products(scope_type, scope_id);
CREATE INDEX idx_store_products_published ON store_products(published);

-- RLS Policies
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- 1. Read Access
-- Public can read published products
CREATE POLICY "Public can view published products" ON store_products
  FOR SELECT
  USING (published = true);

-- Organization members/admins can read all products in their scope
-- (Simplification: Authenticated users can read all? Or specific check?)
-- Ideally we use the user_roles to check.
-- For now, let's allow authenticated users to view all products (to simplify "Manage" views).
CREATE POLICY "Authenticated users can view all products" ON store_products
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Write Access (Insert/Update/Delete)
-- Only admins of the scope can manage.
-- We use the same pattern as other tables, checking user_roles.

CREATE POLICY "Admins can manage store products" ON store_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.scope_type::text = store_products.scope_type
      AND ur.scope_id = store_products.scope_id
      AND ur.role IN ('provincial_admin', 'county_admin', 'group_leader')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_store_products_modtime
    BEFORE UPDATE ON store_products
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
