-- Create fulfillment status enum
CREATE TYPE fulfillment_status AS ENUM ('unfulfilled', 'shipped', 'returned');

-- Add fulfillment columns to store_orders
ALTER TABLE store_orders
ADD COLUMN fulfillment_status fulfillment_status NOT NULL DEFAULT 'unfulfilled',
ADD COLUMN shipped_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN store_orders.fulfillment_status IS 'Shipping status of the order';
