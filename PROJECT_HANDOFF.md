# 📦 PROJECT HANDOFF DOCUMENT: Ecommerce Boutique

---

## 📌 Executive Summary
**Project Name:** Ecommerce Boutique  
**Workspace Path:** `c:\Users\David Dagbanja\Documents\ecommerce-boutique`  
**Application Type:** Full-Stack E-Commerce Boutique Web Application  
**Primary Stack:** React (Vite) SPA + Node.js (Express) REST API + MySQL Database  
**Last Updated:** August 13, 2026  

Ecommerce Boutique is a premium full-stack e-commerce web application featuring a rich storefront, user authentication, database-backed cart and wishlist management, real-time Paystack payment processing (with HMAC webhook order recovery), and an admin dashboard equipped with dynamic visual analytics and management tools.

---

## 🛠️ Technology Stack & Architecture

### Frontend Layer (`/client`)
- **Framework:** React 18 with Vite (`@vitejs/plugin-react`)
- **Routing:** `react-router-dom` v6
- **Icons & UI:** `lucide-react`, `react-icons`
- **Styling:** Custom CSS design system with CSS variables, responsive grids, and modern flexbox layouts.
- **State Management & Persistence:**
  - `AuthContext.jsx`: User auth state, JWT token persistence (`localStorage['boutique_token']`), login/register/profile management.
  - `CartContext.jsx`: Guest cart persistence in `localStorage['boutique_cart']`, automatic merging with database cart upon login (`syncCart`), optimistic UI state updates with background API synchronization.
- **Offline Resilience:** `productService.js` contains a built-in fallback catalog (`SAMPLE_PRODUCTS`) and client-side filtering engine (`filterSampleProducts`). If the backend server or MySQL database is down/unreachable, the frontend degrades gracefully without breaking the browsing experience.

### Backend Layer (`/server`)
- **Runtime:** Node.js (ES Modules `"type": "module"`)
- **Framework:** Express.js (`^4.19.2`)
- **Database Driver:** `mysql2/promise` with connection pooling (`mysql.createPool`)
- **Authentication & Security:** `bcryptjs` (password hashing), `jsonwebtoken` (JWT bearer tokens), `crypto` (secure reset tokens & HMAC signatures)
- **CORS & Body Parser:** `cors` middleware, `express.json()` with raw body buffer preservation (`req.rawBody`) for Paystack webhook signature verification.

### Database Layer (`/database`)
- **Engine:** MySQL (InnoDB engine)
- **Data Serialization:** Dynamic JSON columns (`sizes`, `colors`) in MySQL for array attributes.
- **Automated Schema Migrations:** Auto-run on backend boot in `server/config/db.js` (`runMigrations()`).

---

## 📊 Database Structure & Schema

### Schema Diagram & Relationships
- `users` (1) ─── < (N) `orders`
- `orders` (1) ─── < (N) `order_items`
- `products` (1) ─── < (N) `order_items`
- `users` (1) ─── < (N) `cart_items`
- `products` (1) ─── < (N) `cart_items`
- `users` (1) ─── < (N) `wishlists`
- `products` (1) ─── < (N) `wishlists`

### Database Tables Detail

#### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | User ID |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full Name |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Login Email |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hashed password |
| `role` | `VARCHAR(50)` | `DEFAULT 'customer'` | Account role (`customer`, `admin`) |
| `reset_token` | `VARCHAR(255)` | `NULL` | Password reset token |
| `reset_token_expires`| `TIMESTAMP` | `NULL` | Expiration timestamp for reset token |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation date |

#### 2. `products`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Product ID |
| `name` | `VARCHAR(255)` | `NOT NULL` | Item title |
| `description` | `TEXT` | `NULL` | Item details |
| `price` | `DECIMAL(10, 2)` | `NOT NULL` | Unit price |
| `rating` | `DECIMAL(3, 1)` | `DEFAULT 0.0` | Rating score |
| `category` | `VARCHAR(100)` | `NOT NULL` | Category tag (e.g. Outerwear, Dresses) |
| `image_url` | `TEXT` | `NOT NULL` | Image URL |
| `sizes` | `JSON` | `NULL` | Array of available sizes (e.g. `["S", "M", "L"]`) |
| `colors` | `JSON` | `NULL` | Array of available colors (e.g. `["Black", "Navy"]`) |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation date |

#### 3. `orders`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Internal Order ID |
| `user_id` | `INT` | `FK -> users(id) ON DELETE CASCADE` | Buyer User ID |
| `total_amount` | `DECIMAL(10, 2)` | `NOT NULL` | Total order price |
| `status` | `VARCHAR(50)` | `DEFAULT 'pending'` | Status (`pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) |
| `shipping_address`| `TEXT` | `NULL` | Shipping destination address |
| `payment_method` | `VARCHAR(100)` | `DEFAULT 'Paystack (Card/Momo)'` | Selected payment method |
| `payment_reference`| `VARCHAR(255)`| `UNIQUE NULL` | Paystack reference string |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp |

#### 4. `order_items`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Item ID |
| `order_id` | `INT` | `FK -> orders(id) ON DELETE CASCADE` | Order ID |
| `product_id` | `INT` | `FK -> products(id) ON DELETE RESTRICT` | Product ID |
| `quantity` | `INT` | `NOT NULL DEFAULT 1` | Purchased quantity |
| `selected_size` | `VARCHAR(50)` | `NULL` | Selected size |
| `selected_color` | `VARCHAR(50)` | `NULL` | Selected color |
| `price_at_time` | `DECIMAL(10, 2)` | `NOT NULL` | Price per unit at purchase time |

#### 5. `cart_items`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Cart Item ID |
| `user_id` | `INT` | `FK -> users(id) ON DELETE CASCADE` | Owner User ID |
| `product_id` | `INT` | `FK -> products(id) ON DELETE CASCADE` | Product ID |
| `quantity` | `INT` | `NOT NULL DEFAULT 1` | Item quantity |
| `selected_size` | `VARCHAR(50)` | `DEFAULT 'M'` | Selected size |
| `selected_color` | `VARCHAR(50)` | `DEFAULT 'Default'` | Selected color |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp |
| **Unique Constraint** | - | `uniq_user_prod_size_col` (`user_id`, `product_id`, `selected_size`, `selected_color`) | Ensures no duplicate rows for same product variant |

#### 6. `wishlists`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Wishlist ID |
| `user_id` | `INT` | `FK -> users(id) ON DELETE CASCADE` | Owner User ID |
| `product_id` | `INT` | `FK -> products(id) ON DELETE CASCADE` | Product ID |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp |
| **Unique Constraint** | - | `uniq_user_product` (`user_id`, `product_id`) | Prevents duplicate wishlisting |

---

## 📁 Full Directory & File Structure

```
ecommerce-boutique/
├── database/
│   ├── schema.sql                 # Complete DDL script for database creation
│   └── seed.sql                   # Initial seed data for users, products, and sample orders
├── server/
│   ├── config/
│   │   └── db.js                  # MySQL pool config, query wrapper, and automated migrations
│   ├── controllers/
│   │   ├── adminController.js     # Analytics metrics, all orders, product CRUD, user list
│   │   ├── authController.js      # Register, login, profile update, password reset
│   │   ├── cartController.js      # Cart CRUD & guest cart batch sync
│   │   ├── orderController.js     # Order creation, Paystack verification, customer order history
│   │   ├── paymentController.js   # Paystack HMAC webhook signature verification & order recovery
│   │   ├── productController.js   # Product fetching with search & multi-filter JSON queries
│   │   └── wishlistController.js  # Wishlist addition, removal, and fetching
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT token authentication & admin protection guards
│   │   ├── errorMiddleware.js     # Global error handling
│   │   └── validationMiddleware.js# Input validation helpers
│   ├── routes/
│   │   ├── adminRoutes.js         # /api/admin endpoints
│   │   ├── authRoutes.js          # /api/auth endpoints
│   │   ├── cartRoutes.js          # /api/cart endpoints
│   │   ├── orderRoutes.js         # /api/orders endpoints
│   │   ├── paymentRoutes.js       # /api/payments endpoints
│   │   ├── productRoutes.js       # /api/products endpoints
│   │   └── wishlistRoutes.js      # /api/wishlist endpoints
│   ├── services/
│   │   └── paymentService.js      # Paystack API REST verification & SHA512 signature hashing
│   ├── utils/
│   │   └── helpers.js             # General helper utilities
│   ├── reset-admin.js             # Command line script to reset default admin password
│   ├── server.js                  # Main Express app entry point & middleware mounting
│   └── package.json               # Backend dependencies & script definitions
├── client/
│   ├── public/                    # Static images, favicon, web manifest
│   ├── src/
│   │   ├── assets/                # Images & global styles
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx    # Sidebar navigation & layout wrapper for admin panel
│   │   │   ├── AdminRoute.jsx     # Route protection guard for admin-only pages
│   │   │   ├── CartDrawer.jsx     # Slide-out cart drawer overlay
│   │   │   ├── Footer.jsx         # Global footer
│   │   │   ├── Hero.jsx           # Homepage hero banner
│   │   │   ├── Navbar.jsx         # Navigation bar with cart badge, auth controls, search bar
│   │   │   ├── ProductCard.jsx    # Card view with quick add and wishlist toggle
│   │   │   ├── ProductFilters.jsx # Sidebar filters for category, color, size, price, sort
│   │   │   └── ProductGrid.jsx    # Grid display of product cards
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # Global authentication state context
│   │   │   └── CartContext.jsx    # Global cart state context with guest/DB sync
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── Dashboard.jsx  # Analytics overview, charts, and key metrics
│   │   │   │   ├── Orders.jsx     # Order status management table
│   │   │   │   ├── Product.jsx    # Product inventory management & modal CRUD
│   │   │   │   └── Users.jsx      # Registered user directory list
│   │   │   ├── About.jsx          # Brand story page
│   │   │   ├── Cart.jsx           # Dedicated shopping cart page
│   │   │   ├── Checkout.jsx       # Address input & Paystack payment execution
│   │   │   ├── ForgotPassword.jsx # Request password reset token page
│   │   │   ├── Home.jsx           # Store homepage
│   │   │   ├── Login.jsx          # User login page
│   │   │   ├── ProductDetails.jsx # Detailed item view with size/color selection
│   │   │   ├── Profile.jsx        # Account management & order history
│   │   │   ├── Register.jsx       # User registration page
│   │   │   ├── ResetPassword.jsx  # Token-based password reset page
│   │   │   ├── SearchResults.jsx  # Search results showcase page
│   │   │   └── Shop.jsx           # Catalog browsing page with sidebar filters
│   │   ├── services/
│   │   │   ├── adminService.js    # API calls for admin panel
│   │   │   ├── api.js             # Base fetch wrapper with Bearer token injector
│   │   │   ├── authService.js     # API calls for auth & profile
│   │   │   ├── cartService.js     # API calls for cart operations
│   │   │   ├── orderService.js     # API calls for order creation & fetching
│   │   │   ├── productService.js  # API calls for product catalog + fallback catalog
│   │   │   └── wishlistService.js # API calls for wishlist operations
│   │   ├── App.jsx                # Main React router & layout root
│   │   ├── main.jsx               # React DOM entry point with Providers
│   │   └── index.css              # Custom styling design system & UI theme
│   └── package.json               # Client dependencies & scripts
├── README.md                      # Project documentation
└── PROJECT_HANDOFF.md             # This comprehensive handoff document
```

---

## ⚡ Current Progress & Implemented Features

1. **Authentication & User Management:**
   - Registration & Login with Bcrypt password hashing.
   - JWT-based authentication stored safely in `localStorage`.
   - Profile management allowing users to update their name, email, and password (verifying current password).
   - Self-service password recovery flow (`forgot-password` and `reset-password` using single-use 1-hour expiration tokens).

2. **Catalog Browsing, Search & Filtering:**
   - Server-side multi-parameter filtering API supporting full-text search, multi-category selection, JSON-based color and size filtering using MySQL `JSON_CONTAINS`, price range sliders, and sorting options (price low-to-high, high-to-low, rating).
   - Graceful Fallback Catalog (`SAMPLE_PRODUCTS`): If the server or database is unreachable, the client automatically switches to client-side filtering without crashing.

3. **Cart & Wishlist Systems:**
   - Dual-mode Cart: Guest cart saved locally; automatically syncs and merges into database upon user login (`POST /api/cart/sync`).
   - Optimistic UI updates for immediate feedback on item addition, removal, quantity changes, and size changes.
   - Database-backed wishlist persistence per customer account.

4. **Paystack Payment Integration & Webhook Order Recovery:**
   - Paystack Popup checkout integration for Credit/Debit cards and Mobile Money.
   - Real-time transaction verification on server (`POST /api/orders`) prior to order insertion.
   - Webhook processing (`POST /api/payments/webhook`) using HMAC SHA512 signature verification (`x-paystack-signature` matched against raw payload) to automatically recover orders even if customers close their browser window before returning.

5. **Admin Dashboard & Visual Analytics:**
   - Analytics Overview Cards: Total Sales Revenue, Total Order Count, Total Customers, and Average Order Value (AOV).
   - Monthly Revenue Trend chart/progress bars built via SQL `DATE_FORMAT` aggregations.
   - Category Revenue Distribution and Order Status breakdown (Pending, Processing, Shipped, Delivered, Cancelled).
   - Product Management: Add, update, and delete products (with JSON array formatting for sizes and colors).
   - Order Management: Full view of store orders, customer details, purchased items, and status modification.
   - User Directory: List of all registered users and their assigned roles.

---

## ⚠️ Known Errors, Gotchas & Technical Debt

1. **Paystack Integration Credentials:**
   - Environment variables `PAYSTACK_SECRET` and `VITE_PAYSTACK_PUBLIC_KEY` must be populated in `.env` files. Test keys (`pk_test_...` / `sk_test_...`) should be swapped for live keys when deploying to production.

2. **Product Deletion Foreign Key Constraint:**
   - If an admin attempts to delete a product that exists in `order_items`, MySQL returns constraint error `ER_ROW_IS_REFERENCED_2`.
   - *Current Handling:* `adminController.js` catches this error and responds with a user-friendly message (`Cannot delete product because it has been ordered in customer orders.`).
   - *Recommended Solution:* Implement soft deletion (`is_archived = TINYINT(1)`) on `products` table.

3. **Password Reset Email Delivery:**
   - `forgotPassword` currently returns the generated `resetToken` in the API JSON response for developer convenience.
   - *Required for Production:* Integrate an email transport service (e.g. Nodemailer with SMTP, SendGrid, or Resend) to send reset links via email and suppress raw token return.

4. **MySQL JSON Compatibility:**
   - The query engine uses `JSON_CONTAINS()` for color/size filtering. Ensure MySQL server version is 5.7.8+ or 8.0+.

5. **Default Seed Admin Credentials:**
   - **Email:** `admin@boutique.com`
   - **Password:** `admin123` (automatically updated in database startup migration if placeholder exists).

---

## 🗺️ Remaining Tasks & Product Roadmap

- [x] **Soft Product Deletion:** Added `is_archived` boolean column to `products` table, excluded archived products from public shop query, added admin archive toggle, and implemented graceful soft-archive fallback when deleting products with order history.
- [x] **Email Notification System:** Integrated Nodemailer `emailService.js` with HTML templates for password reset links and order confirmation receipts (with dev console fallback).
- [x] **Customer Product Reviews & Ratings:** Created `reviews` table, `reviewController.js`, `reviewService.js`, and interactive review submit & list component in `ProductDetails.jsx`.
- [x] **Inventory & Stock Tracking:** Added `stock_quantity` column, stock management in `Admin/Product.jsx`, and stock state with "Out of Stock" / "Low Stock" UI badges in `ProductDetails.jsx`.
- [x] **Automated Testing Suite:** Implemented Jest & Supertest unit/integration test suite (`server/tests/auth.test.js`, `products.test.js`, `reviews.test.js`). 8/8 tests passing.
- [x] **Dockerization & Container Setup:** Added backend `server/Dockerfile`, frontend multi-stage Nginx `client/Dockerfile`, and multi-container orchestration via `docker-compose.yml`.
- [ ] **Deployment & CI/CD Pipeline:** Set up automated CI/CD deployment pipeline to production hosting (e.g. Render/Railway for backend, Vercel/Netlify for frontend, PlanetScale/Aiven for MySQL).

---

## 🤖 Instructions for the Next AI Agent / Developer

When taking over this repository, follow these precise steps to get up and running:

### Step 1: Environment Setup
Ensure `.env` files exist in both `server/` and `client/` directories.

**`server/.env`:**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_boutique
DB_PORT=3306
JWT_SECRET=super_secret_jwt_key_boutique_2026
PAYSTACK_SECRET=your_paystack_secret_key_here
```

**`client/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key_here
```

### Step 2: Database Initialization
1. Ensure your local MySQL server is running.
2. Create the database:
   ```sql
   CREATE DATABASE ecommerce_boutique;
   ```
3. Run the schema DDL script:
   ```bash
   mysql -u root -p ecommerce_boutique < database/schema.sql
   ```
4. Run the seed data script:
   ```bash
   mysql -u root -p ecommerce_boutique < database/seed.sql
   ```
*(Note: When the backend server boots, `db.js` will automatically execute `runMigrations()` to verify tables and migrate any missing columns.)*

### Step 3: Run the Application

#### Option A: Running via Docker Compose (Recommended)
Launch the entire stack (MySQL 8.0 DB, Express Backend API, and Nginx Frontend) with a single command:
```bash
docker-compose up --build
```
- **Frontend SPA:** `http://localhost`
- **Backend API:** `http://localhost:5000/api`
- **MySQL DB:** `localhost:3306`

#### Option B: Running Locally (Node.js & Local MySQL)
1. **Start the Express Server:**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   *Expected Output:*
   ```
   Server running on port 5000
   Successfully verified cart_items table exists in database.
   Successfully verified wishlists table exists in database.
   ```
2. **Start the Vite Frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *Expected Output:*
   ```
   Vite v5.2.0 ready in XXX ms
   ➜ Local: http://localhost:5173/
   ```

### Step 4: Verification & Testing Checklist
- [ ] Test Database Connectivity: Open `http://localhost:5000/api/test-db` in your browser.
- [ ] Test Admin Access: Log in on frontend with `admin@boutique.com` / `admin123` and navigate to `/admin`. Verify analytics cards, charts, and tables load.
- [ ] Test Customer Browsing: Go to `/shop`, test category selection, price filtering, and sorting.
- [ ] Test Cart Sync: Add items as guest, then log in. Confirm items merge automatically into database cart.
- [ ] Test Order Flow: Place a test order using Paystack popup test card details. Verify order displays in `/profile` and `/admin/orders`.

---
*End of Handoff Document. Prepared by AI Agent pair-programming assistant.*
