-- Fix RLS policies for purchases table
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;
DROP POLICY IF EXISTS "Service role can manage purchases" ON purchases;

-- Create new RLS policies for purchases
CREATE POLICY "Users can view their own purchases"
  ON purchases
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

CREATE POLICY "Users can insert their own purchases"
  ON purchases
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

CREATE POLICY "Users can update their own purchases"
  ON purchases
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
  );

-- Fix RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own user data" ON auth.users;
DROP POLICY IF EXISTS "Users can update their own user data" ON auth.users;

-- Create new RLS policies for users table
CREATE POLICY "Users can view their own user data"
  ON auth.users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can update their own user data"
  ON auth.users
  FOR UPDATE
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

-- Create webhook handler role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'webhook_handler') THEN
    CREATE ROLE webhook_handler;
    GRANT USAGE ON SCHEMA public TO webhook_handler;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO webhook_handler;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO webhook_handler;
  END IF;
END
$$;

-- Update any pending purchases that should be completed
UPDATE purchases
SET status = 'completed'
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '1 hour'
AND stripe_session_id IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_product_id ON purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_purchases_updated_at ON purchases;
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON purchases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ensure RLS is enabled on all tables
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  USING (published = true OR auth.jwt() ->> 'role' = 'admin');

-- Create policies for courses table
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON courses;
CREATE POLICY "Courses are viewable by everyone"
  ON courses
  FOR SELECT
  USING (true);

-- Fix any orphaned purchases (product doesn't exist)
DELETE FROM purchases p
WHERE NOT EXISTS (
  SELECT 1 FROM products pr WHERE pr.id = p.product_id
);

-- Insert a test purchase for debugging if needed
-- INSERT INTO purchases (id, user_id, product_id, amount, status, created_at, updated_at, test_mode, stripe_session_id)
-- VALUES (gen_random_uuid(), '6b3f23cb-e949-4582-ac31-4b279aa02cdc', 'd81887ce-9969-4bef-8f83-2d069fa2d80d', 79.99, 'completed', NOW(), NOW(), true, 'cs_test_debug');

-- Check and fix course-product relationships
DO $$
BEGIN
  -- Check for courses without products
  IF EXISTS (
    SELECT c.id 
    FROM courses c
    LEFT JOIN products p ON p.id = c.product_id
    WHERE p.id IS NULL
  ) THEN
    RAISE NOTICE 'Found courses without corresponding products';
  END IF;

  -- Check for products that should be courses but aren't
  IF EXISTS (
    SELECT p.id 
    FROM products p
    LEFT JOIN courses c ON c.product_id = p.id
    WHERE c.id IS NULL 
    AND p.title LIKE '%Course%'
  ) THEN
    RAISE NOTICE 'Found products that should be courses';
  END IF;

  -- Ensure all course products are published
  UPDATE products p
  SET published = true
  FROM courses c
  WHERE c.product_id = p.id
  AND p.published = false;

  -- Create missing course entries for course products
  INSERT INTO courses (product_id, difficulty_level, estimated_duration)
  SELECT p.id, 'beginner', '4 weeks'
  FROM products p
  LEFT JOIN courses c ON c.product_id = p.id
  WHERE c.id IS NULL 
  AND p.title LIKE '%Course%';
END $$;

-- Add status check to purchases table
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_status_check;
ALTER TABLE purchases ADD CONSTRAINT purchases_status_check 
  CHECK (status IN ('pending', 'completed', 'failed', 'superseded'));

-- Fix permissions for service role
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Allow service role to access auth.users table
CREATE POLICY "Service role can access all users"
  ON auth.users
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role')::text = 'service_role'
    OR (current_setting('request.jwt.claims', true)::json->>'role')::text = 'authenticated'
  );

-- Grant necessary permissions to service role
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO service_role;
GRANT ALL ON purchases TO service_role; 