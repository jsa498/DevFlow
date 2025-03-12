-- Fix Purchases Table SQL

-- Check the structure of the purchases table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'purchases';

-- Count all purchases
SELECT COUNT(*) FROM purchases;

-- Check for completed purchases
SELECT COUNT(*) FROM purchases WHERE status = 'completed';

-- Check for pending purchases
SELECT COUNT(*) FROM purchases WHERE status = 'pending';

-- Check for purchases with null user_id
SELECT COUNT(*) FROM purchases WHERE user_id IS NULL;

-- Check for purchases with null product_id
SELECT COUNT(*) FROM purchases WHERE product_id IS NULL;

-- Check for purchases with null status
SELECT COUNT(*) FROM purchases WHERE status IS NULL;

-- Check for purchases with null test_mode
SELECT COUNT(*) FROM purchases WHERE test_mode IS NULL;

-- Check for purchases with null stripe_session_id
SELECT COUNT(*) FROM purchases WHERE stripe_session_id IS NULL;

-- Check for purchases by status
SELECT status, COUNT(*) FROM purchases GROUP BY status;

-- Check for purchases by user
SELECT user_id, COUNT(*) FROM purchases GROUP BY user_id;

-- Check for purchases by product
SELECT product_id, COUNT(*) FROM purchases GROUP BY product_id;

-- Check for duplicate purchases (same user and product)
SELECT user_id, product_id, COUNT(*) 
FROM purchases 
WHERE status = 'completed'
GROUP BY user_id, product_id 
HAVING COUNT(*) > 1;

-- Fix null test_mode values
UPDATE purchases SET test_mode = TRUE WHERE test_mode IS NULL;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS purchases_user_id_idx ON purchases(user_id);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS purchases_status_idx ON purchases(status);

-- Create index on product_id for faster queries
CREATE INDEX IF NOT EXISTS purchases_product_id_idx ON purchases(product_id);

-- Create unique constraint to prevent duplicate purchases
ALTER TABLE purchases 
DROP CONSTRAINT IF EXISTS unique_user_product_completed;

-- Drop the unique index if it exists before creating it again
DROP INDEX IF EXISTS unique_user_product_completed_idx;

CREATE UNIQUE INDEX unique_user_product_completed_idx ON purchases(user_id, product_id) 
WHERE status = 'completed';

-- Create policy to ensure users can view their own purchases
DROP POLICY IF EXISTS purchases_select_policy ON purchases;
CREATE POLICY purchases_select_policy ON purchases
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'
  ));

-- Create policy to ensure webhook can update purchases
DROP POLICY IF EXISTS purchases_update_policy ON purchases;
CREATE POLICY purchases_update_policy ON purchases
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'
  ) OR (SELECT current_setting('request.jwt.claims', true)::json->>'app_metadata')::json->>'role' = 'service_role');

-- Create policy to ensure webhook can insert purchases
DROP POLICY IF EXISTS purchases_insert_policy ON purchases;
CREATE POLICY purchases_insert_policy ON purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin'
  ) OR (SELECT current_setting('request.jwt.claims', true)::json->>'app_metadata')::json->>'role' = 'service_role');

-- Update any pending purchases that should be completed
UPDATE purchases
SET status = 'completed'
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '1 hour'
AND stripe_session_id IS NOT NULL;

-- Check for orphaned purchases (product doesn't exist)
SELECT p.id, p.user_id, p.product_id
FROM purchases p
LEFT JOIN products pr ON p.product_id = pr.id
WHERE pr.id IS NULL;

-- Check for orphaned purchases (user doesn't exist)
SELECT p.id, p.user_id, p.product_id
FROM purchases p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;