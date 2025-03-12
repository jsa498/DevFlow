-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    pdf_url TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Create function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER purchases_updated_at
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (published = true);

CREATE POLICY "Products are insertable by admin only"
    ON products FOR INSERT
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Products are updatable by admin only"
    ON products FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Create policies for purchases
CREATE POLICY "Users can view their own purchases"
    ON purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
    ON purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policies for cart_items
CREATE POLICY "Users can view their own cart items"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id); 