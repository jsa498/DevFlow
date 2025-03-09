-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own cart items
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT
USING (auth.uid()::text = user_id);

-- Allow users to insert their own cart items
CREATE POLICY "Users can insert their own cart items"
ON cart_items FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own cart items
CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete their own cart items
CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE
USING (auth.uid()::text = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 