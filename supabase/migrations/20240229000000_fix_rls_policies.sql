-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON purchases;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON courses;
DROP POLICY IF EXISTS "Service role can update purchases" ON purchases;

-- Create policy for purchases table
CREATE POLICY "Users can view their own purchases"
ON purchases
FOR SELECT
USING (
  auth.uid() = user_id OR 
  auth.jwt() ->> 'role' = 'admin' OR 
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Create policy for products table
CREATE POLICY "Enable read access for all users"
ON products
FOR SELECT
USING (published = true OR auth.jwt() ->> 'role' = 'admin');

-- Create policy for courses table
CREATE POLICY "Enable read access for all users"
ON courses
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM products p 
  WHERE p.id = courses.product_id 
  AND (p.published = true OR auth.jwt() ->> 'role' = 'admin')
));

-- Ensure service role can update purchases
CREATE POLICY "Service role can update purchases"
ON purchases
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  auth.jwt() ->> 'role' = 'admin' OR 
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
); 