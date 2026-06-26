-- Seed data for Ecommerce Boutique (MySQL)

-- Seed Admin and Dummy User
INSERT INTO users (name, email, password_hash, role) VALUES 
('Admin User', 'admin@boutique.com', 'hashed_password_placeholder', 'admin'),
('John Doe', 'john@example.com', 'hashed_password_placeholder', 'customer')
ON DUPLICATE KEY UPDATE email=email;

-- Seed Products (using JSON formatting for arrays)
INSERT INTO products (name, description, price, rating, category, image_url, sizes, colors) VALUES 
('Classic Leather Jacket', 'A timeless leather jacket crafted from premium materials. Perfect for any season.', 299.99, 4.8, 'Outerwear', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', '["S", "M", "L", "XL"]', '["Black", "Brown"]'),
('Minimalist Slip Dress', 'Elegant and simple silk slip dress. A wardrobe essential for evening wear.', 120.00, 4.5, 'Dresses', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M", "L"]', '["Black", "White", "Navy"]'),
('Oversized Wool Sweater', 'Cozy up in this ultra-soft, oversized wool blend sweater.', 85.50, 4.7, 'Knitwear', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80', '["S", "M", "L"]', '["Beige", "Olive"]'),
('Tailored Wide-Leg Trousers', 'Sophisticated wide-leg trousers that sit perfectly on the waist.', 95.00, 4.4, 'Bottoms', 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M", "L", "XL"]', '["Black", "Navy", "Beige"]'),
('Premium Oxford Shirt', 'A classic fit Oxford shirt made from breathable cotton.', 65.00, 4.2, 'Shirts', 'https://images.unsplash.com/photo-1434389678369-18361fc474cc?auto=format&fit=crop&w=800&q=80', '["S", "M", "L", "XL"]', '["White", "Blue"]'),
('Silk Blend Crop Top', 'A chic crop top for casual or formal wear.', 45.00, 4.6, 'Tops', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M"]', '["Black", "White"]'),
('Vintage Graphic T-Shirt', 'Soft, vintage-wash t-shirt with a relaxed fit.', 35.00, 4.9, 'Essentials', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80', '["S", "M", "L", "XL"]', '["Black", "White", "Olive"]'),
('Classic Summer Dress', 'Lightweight and flowy summer dress for warm days.', 75.00, 4.3, 'Dresses', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M", "L"]', '["Navy", "White", "Beige"]');

-- Seed Initial Order for testing
INSERT INTO orders (id, user_id, total_amount, status) VALUES 
(1, 2, 419.99, 'delivered')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Order Items
INSERT INTO order_items (order_id, product_id, quantity, selected_size, selected_color, price_at_time) VALUES 
(1, 1, 1, 'M', 'Black', 299.99),
(1, 2, 1, 'S', 'Navy', 120.00);
