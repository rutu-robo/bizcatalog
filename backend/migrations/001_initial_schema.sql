-- ==============================================================================
-- BIZCATALOG PRODUCTION RELATIONAL DATABASE SCHEMA
-- Target Database: PostgreSQL 14+ / MySQL 8.0+ Compatible
-- Description: Cetak biru skema database terpisah per entitas/domain untuk live production
-- ==============================================================================

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'ultimate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. WEBSITES & BUSINESS PROFILES
CREATE TABLE IF NOT EXISTS websites (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE,
    subdomain VARCHAR(50) NOT NULL UNIQUE,
    business_name VARCHAR(150) NOT NULL,
    tagline VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    address TEXT DEFAULT '',
    phone VARCHAR(30) DEFAULT '',
    email VARCHAR(191) DEFAULT '',
    whatsapp VARCHAR(30) DEFAULT '',
    instagram VARCHAR(100) DEFAULT '',
    facebook VARCHAR(100) DEFAULT '',
    tiktok VARCHAR(100) DEFAULT '',
    logo_url TEXT DEFAULT '',
    theme_id VARCHAR(50) NOT NULL DEFAULT 'minimalist',
    header_style VARCHAR(30) NOT NULL DEFAULT 'dynamic-scroll' CHECK (header_style IN ('solid', 'floating', 'dynamic-scroll')),
    operating_hours VARCHAR(100) DEFAULT '',
    bank_name VARCHAR(100) DEFAULT '',
    bank_account_no VARCHAR(50) DEFAULT '',
    bank_account_name VARCHAR(150) DEFAULT '',
    qris_image_url TEXT DEFAULT '',
    enable_cod BOOLEAN NOT NULL DEFAULT TRUE,
    enable_bank_transfer BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_website_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_websites_subdomain ON websites(subdomain);
CREATE INDEX idx_websites_user_id ON websites(user_id);

-- 3. PRODUCT CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    website_id VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT uq_category_website_slug UNIQUE (website_id, slug)
);

CREATE INDEX idx_categories_website ON categories(website_id);

-- 4. PRODUCTS CATALOG
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    website_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64),
    name VARCHAR(150) NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100) DEFAULT '',
    image_url TEXT DEFAULT '',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_products_website ON products(website_id);
CREATE INDEX idx_products_category ON products(website_id, category);

-- 5. VISUAL SECTION BUILDER CONFIGURATION
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(64) PRIMARY KEY,
    website_id VARCHAR(64) NOT NULL,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(150) DEFAULT '',
    subtitle VARCHAR(255) DEFAULT '',
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    "order" INT NOT NULL DEFAULT 0,
    variant VARCHAR(50) NOT NULL DEFAULT 'default',
    bg_color VARCHAR(50) DEFAULT '',
    bg_image_url TEXT DEFAULT '',
    text_align VARCHAR(20) DEFAULT 'left',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_section_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE,
    CONSTRAINT uq_section_website_type UNIQUE (website_id, type)
);

CREATE INDEX idx_sections_website_order ON sections(website_id, "order");

-- 6. ORDERS & E-COMMERCE TRANSACTIONS
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(64) PRIMARY KEY,
    website_id VARCHAR(64) NOT NULL,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_email VARCHAR(191) DEFAULT '',
    customer_address TEXT NOT NULL,
    delivery_courier VARCHAR(100) NOT NULL,
    shipping_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('transfer_bank', 'qris', 'cod')),
    payment_proof_url TEXT DEFAULT '',
    status VARCHAR(30) NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'payment_uploaded', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
    tracking_number VARCHAR(100) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_website ON orders(website_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(website_id, status);

-- 7. ORDER ITEMS (ONE-TO-MANY WITH ORDERS)
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(64) PRIMARY KEY,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64),
    product_name VARCHAR(150) NOT NULL,
    product_price NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(15, 2) NOT NULL,
    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- 8. TESTIMONIALS & CUSTOMER REVIEWS
CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(64) PRIMARY KEY,
    website_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    role_or_title VARCHAR(100) DEFAULT '',
    content TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_testimonial_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE INDEX idx_testimonials_website ON testimonials(website_id);

-- 9. GALLERIES & WORKSHOP PHOTOS
CREATE TABLE IF NOT EXISTS galleries (
    id VARCHAR(64) PRIMARY KEY,
    website_id VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    category VARCHAR(100) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gallery_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE INDEX idx_galleries_website ON galleries(website_id);

-- 10. MEDIA ASSETS LIBRARY
CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(64) PRIMARY KEY,
    website_id VARCHAR(64) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asset_website FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE INDEX idx_assets_website ON assets(website_id);
