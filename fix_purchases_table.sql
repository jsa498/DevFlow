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

-- First, disable the existing unique constraint and index
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS unique_user_product_completed;
DROP INDEX IF EXISTS unique_user_product_completed_idx;

-- Begin transaction for safety
BEGIN;

-- First, let's identify any duplicate completed purchases
CREATE TEMP TABLE duplicate_purchases AS
SELECT user_id, product_id, COUNT(*) as purchase_count
FROM purchases 
WHERE status = 'completed'
GROUP BY user_id, product_id 
HAVING COUNT(*) > 1;

-- Log the duplicates for reference
SELECT * FROM duplicate_purchases;

-- Keep only the most recent completed purchase for each user-product combination
WITH ranked_purchases AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id, product_id 
                           ORDER BY created_at DESC) as rn
  FROM purchases
  WHERE status = 'completed'
  AND (user_id, product_id) IN (
    SELECT user_id, product_id FROM duplicate_purchases
  )
)
UPDATE purchases SET status = 'superseded'
WHERE id IN (
  SELECT id FROM ranked_purchases WHERE rn > 1
);

-- Verify the cleanup
SELECT user_id, product_id, COUNT(*) 
FROM purchases 
WHERE status = 'completed'
GROUP BY user_id, product_id 
HAVING COUNT(*) > 1;

-- If everything looks good, create the unique index
CREATE UNIQUE INDEX unique_user_product_completed_idx 
ON purchases(user_id, product_id) 
WHERE status = 'completed';

-- Clean up temp table
DROP TABLE duplicate_purchases;

-- Commit the transaction if everything succeeded
COMMIT;

-- Update any pending purchases that should be completed
UPDATE purchases
SET status = 'completed'
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '1 hour'
AND stripe_session_id IS NOT NULL;

-- Clean up any duplicate pending purchases
DELETE FROM purchases a 
USING purchases b
WHERE a.user_id = b.user_id 
AND a.product_id = b.product_id
AND a.status = 'pending'
AND b.status = 'pending'
AND a.created_at < b.created_at;

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