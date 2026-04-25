-- Supabase Schema for Menha Boutique
-- Migrated from node-pg-migrate migrations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    profile_photo TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    role VARCHAR(50) DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    sequence INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Brands table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2) NOT NULL,
    weight VARCHAR(50),
    stock_quantity INTEGER DEFAULT 0 NOT NULL,
    item_left VARCHAR(50),
    status VARCHAR(50) DEFAULT 'In Stock' NOT NULL,
    sale_tag VARCHAR(50),
    location VARCHAR(100),
    rating DECIMAL(2,1) DEFAULT 0 NOT NULL,
    primary_image TEXT NOT NULL,
    sequence INTEGER DEFAULT 0 NOT NULL,
    is_special BOOLEAN DEFAULT FALSE,
    is_combo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Product Images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. Product Attributes table
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_type VARCHAR(50) NOT NULL,
    attribute_value VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    old_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    is_default BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(50), -- e.g., 'home', 'work'
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 8. Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255), -- for guest checkout
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'unpaid' NOT NULL,
    payment_method VARCHAR(50),
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    payment_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 9. Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    attribute_id UUID REFERENCES product_attributes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. Banners table
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link TEXT,
    type VARCHAR(50) DEFAULT 'main',
    sequence INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 11. Delivery Tariffs table
CREATE TABLE IF NOT EXISTS delivery_tariffs (
    id SERIAL PRIMARY KEY,
    max_weight INTEGER NOT NULL,
    prices JSONB NOT NULL, -- { "TN": 40, "SOUTH": 55, "REST": 110, "NE": 120 }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. Countries table
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE,
    phone_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. States table (to map to zones)
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    country_id INTEGER REFERENCES countries(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10),
    zone VARCHAR(50) DEFAULT 'REST',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 14. Cities (Districts) table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(state_id, name)
);

-- 15. Payment Gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'payment_gateway',
    credentials JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_test_mode BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- RPC for Registering User (handles Auth and Table Insertion)
-- Note: This requires pgcrypto for password hashing if not using Supabase Auth directly
CREATE OR REPLACE FUNCTION register_user(
  p_email TEXT,
  p_password_hash TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone_number TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO users (email, password_hash, first_name, last_name, phone_number)
  VALUES (p_email, p_password_hash, p_first_name, p_last_name, p_phone_number)
  RETURNING id INTO v_user_id;

  RETURN json_build_object(
    'success', true,
    'user_id', v_user_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- Add RLS or Security Policies as needed. For now, using it in direct mode as seen in admin.js.

-- Seed Tariffs
INSERT INTO delivery_tariffs (max_weight, prices) VALUES 
(750, '{"TN": 40, "SOUTH": 55, "REST": 110, "NE": 120}'),
(1700, '{"TN": 50, "SOUTH": 95, "REST": 160, "NE": 200}'),
(2700, '{"TN": 70, "SOUTH": 110, "REST": 180, "NE": 300}'),
(3700, '{"TN": 90, "SOUTH": 120, "REST": 240, "NE": 0}'),
(4700, '{"TN": 110, "SOUTH": 150, "REST": 250, "NE": 0}'),
(5700, '{"TN": 120, "SOUTH": 180, "REST": 300, "NE": 0}'),
(6700, '{"TN": 140, "SOUTH": 210, "REST": 350, "NE": 0}'),
(7700, '{"TN": 160, "SOUTH": 240, "REST": 400, "NE": 0}'),
(8700, '{"TN": 180, "SOUTH": 270, "REST": 450, "NE": 0}'),
(9700, '{"TN": 200, "SOUTH": 300, "REST": 500, "NE": 0}'),
(12000, '{"TN": 220, "SOUTH": 360, "REST": 600, "NE": 0}'),
(15000, '{"TN": 240, "SOUTH": 450, "REST": 750, "NE": 0}'),
(20000, '{"TN": 300, "SOUTH": 600, "REST": 900, "NE": 0}')
ON CONFLICT DO NOTHING;

-- Seed States for Zones
INSERT INTO states (name, code, zone) VALUES
('Tamil Nadu', 'TN', 'TN'),
('Andhra Pradesh', 'AP', 'SOUTH'),
('Karnataka', 'KA', 'SOUTH'),
('Kerala', 'KL', 'SOUTH'),
('Telangana', 'TG', 'SOUTH'),
('Puducherry', 'PY', 'SOUTH'),
('Arunachal Pradesh', 'AR', 'NE'),
('Assam', 'AS', 'NE'),
('Manipur', 'MN', 'NE'),
('Meghalaya', 'ML', 'NE'),
('Mizoram', 'MZ', 'NE'),
('Nagaland', 'NL', 'NE'),
('Sikkim', 'SK', 'NE'),
('Tripura', 'TR', 'NE')
ON CONFLICT DO NOTHING;

-- 16. Couriers Table
CREATE TABLE IF NOT EXISTS couriers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add courier columns to orders if not present
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='orders' AND COLUMN_NAME='courier_id') THEN
        ALTER TABLE orders ADD COLUMN courier_id UUID REFERENCES couriers(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='orders' AND COLUMN_NAME='courier_name') THEN
        ALTER TABLE orders ADD COLUMN courier_name VARCHAR(255);
    END IF;
END $$;
