-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('farmer', 'consumer', 'delivery')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create farmers table (extends users)
CREATE TABLE IF NOT EXISTS farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create delivery_boys table (extends users)
CREATE TABLE IF NOT EXISTS delivery_boys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  vehicle_type TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  unit TEXT NOT NULL,
  image_url TEXT,
  expiry_date DATE NOT NULL,
  is_expired BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'offline',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  delivery_address TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create function to auto-delete expired products
CREATE OR REPLACE FUNCTION mark_expired_products()
RETURNS void AS $$
BEGIN
  UPDATE products SET is_expired = TRUE WHERE expiry_date < CURRENT_DATE AND is_expired = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_boys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any) to allow re-running this script
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view farmer profiles" ON farmers;
DROP POLICY IF EXISTS "Farmers can update their own profile" ON farmers;
DROP POLICY IF EXISTS "Anyone can view delivery profiles" ON delivery_boys;
DROP POLICY IF EXISTS "Delivery riders can update their own profile" ON delivery_boys;
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Farmers can insert their own products" ON products;
DROP POLICY IF EXISTS "Farmers can update their own products" ON products;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Consumers can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update their orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Consumers can leave reviews" ON reviews;

-- Create RLS policies for users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for farmers
CREATE POLICY "Anyone can view farmer profiles" ON farmers
  FOR SELECT USING (TRUE);

CREATE POLICY "Farmers can update their own profile" ON farmers
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS for delivery_boys
CREATE POLICY "Anyone can view delivery profiles" ON delivery_boys
  FOR SELECT USING (TRUE);

CREATE POLICY "Delivery riders can update their own profile" ON delivery_boys
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_expired = FALSE);

CREATE POLICY "Farmers can insert their own products" ON products
  FOR INSERT WITH CHECK (
    farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()::uuid)
  );

CREATE POLICY "Farmers can update their own products" ON products
  FOR UPDATE USING (
    farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()::uuid)
  );

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    consumer_id = auth.uid()::uuid OR 
    farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()::uuid)
  );

CREATE POLICY "Consumers can create orders" ON orders
  FOR INSERT WITH CHECK (consumer_id = auth.uid()::uuid);

CREATE POLICY "Users can update their orders" ON orders
  FOR UPDATE USING (
    consumer_id = auth.uid()::uuid OR 
    farmer_id IN (SELECT id FROM farmers WHERE user_id = auth.uid()::uuid)
  );

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Consumers can leave reviews" ON reviews
  FOR INSERT WITH CHECK (consumer_id = auth.uid()::uuid);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_expiry ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_orders_consumer_id ON orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_reviews_farmer_id ON reviews(farmer_id);
