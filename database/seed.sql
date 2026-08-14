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
('Classic Summer Dress', 'Lightweight and flowy summer dress for warm days.', 75.00, 4.3, 'Dresses', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M", "L"]', '["Navy", "White", "Beige"]'),
('Structured Blazer Dress', 'Double-breasted blazer dress with sharp shoulders and custom gold buttons.', 285.00, 4.9, 'Dresses', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M", "L"]', '["Black", "White"]'),
('Italian Leather Ankle Boots', 'Handcrafted Italian calfskin ankle boots featuring a sleek pointed toe.', 320.00, 4.95, 'Accessories', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80', '["37", "38", "39", "40"]', '["Black", "Brown"]'),
('Classic Vintage Denim Jacket', 'Heavyweight organic cotton denim jacket with authentic washed treatment.', 175.00, 4.8, 'Outerwear', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80', '["S", "M", "L", "XL"]', '["Blue", "Black"]'),
('Linen Summer Button-Down', 'Breathable 100% French linen shirt tailored for effortless resort wear.', 110.00, 4.7, 'Shirts', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80', '["S", "M", "L", "XL"]', '["White", "Beige", "Blue"]'),
('Satin A-Line Midi Skirt', 'Luxurious bias-cut satin midi skirt featuring an elastic waistband.', 125.00, 4.85, 'Bottoms', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M", "L"]', '["Black", "Beige", "Navy"]'),
('Velvet Evening Tuxedo Blazer', 'Plush cotton velvet tuxedo jacket with satin shawl lapels and silk lining.', 410.00, 5.0, 'Outerwear', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80', '["S", "M", "L", "XL"]', '["Black", "Navy"]'),
('Ribbed Cotton Tank Top', 'Essential fitted tank top knit from stretch organic ribbed cotton.', 65.00, 4.6, 'Tops', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', '["XS", "S", "M", "L"]', '["White", "Black", "Olive"]'),
('Pleated Chiffon Maxi Dress', 'Floating sunray pleated chiffon gown with delicate spaghetti straps.', 260.00, 4.9, 'Dresses', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80', '["S", "M", "L"]', '["Navy", "White", "Beige"]'),
('Designer Leather Waist Belt', 'Polished calfskin belt with signature geometric brass buckle.', 85.00, 4.8, 'Accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', '["S", "M", "L"]', '["Black", "Brown"]'),
('Chunky Cable Knit Cardigan', 'Heavyweight hand-knit cardigan sweater featuring horn buttons.', 195.00, 4.9, 'Knitwear', 'https://images.unsplash.com/photo-1434389678369-18361fc474cc?auto=format&fit=crop&w=800&q=80', '["S", "M", "L", "XL"]', '["Beige", "White", "Olive"]');

-- Seed Initial Order for testing
INSERT INTO orders (id, user_id, total_amount, status) VALUES 
(1, 2, 419.99, 'delivered')
ON DUPLICATE KEY UPDATE id=id;

-- Seed Order Items
INSERT INTO order_items (order_id, product_id, quantity, selected_size, selected_color, price_at_time) VALUES 
(1, 1, 1, 'M', 'Black', 299.99),
(1, 2, 1, 'S', 'Navy', 120.00);
