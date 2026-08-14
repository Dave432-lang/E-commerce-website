# 🛍️ Ecommerce Boutique — Full Stack Luxury Apparel Platform

A modern, high-performance E-Commerce & Admin Dashboard platform designed for luxury apparel retail. Built with **React 18 + Vite**, **Node.js + Express**, **MySQL**, and integrated with **Paystack Payment Gateway** for Mobile Money (MTN, Telecel, AirtelTigo) and Card transactions within Ghana.

---

## ✨ Features

### 🛒 Customer Storefront
- **Responsive Navigation**: Full mobile navigation drawer and search dropdown.
- **Product Catalog & Advanced Filtering**: Filter by category, price slider, color swatches, and size chips.
- **Instant Search**: Instant live autocomplete search bar with thumbnail previews.
- **Customer Reviews & Star Ratings**: Submit 1-5 star ratings and reviews; auto-calculates average rating per product.
- **Wishlist Management**: Save favorite apparel items directly to user profile.
- **Cart & Slide-out Drawer**: Persistent local shopping cart with item quantity and size configuration.
- **Paystack Payment Integration**: Supports Visa, Mastercard, and Ghana Mobile Money.
- **Discount Coupons & Promo Codes**: Real-time promo code validation and checkout discount deduction.
- **PDF Invoice Download**: Print or download itemized PDF receipts directly from customer order history.

### 🛡️ Admin Dashboard
- **Store Analytics & Metrics**: Real-time sales overview, revenue metrics, and inventory health.
- **Visual SVG Charts**: Daily sales trend charts and order status distribution breakdown.
- **Product Management**: Full CRUD capabilities with soft deletion (Archiving) support.
- **Order Processing**: View, update order status (`Processing`, `Shipped`, `Delivered`, `Cancelled`), and track references.
- **Coupon Manager**: Create, list, and delete discount codes (`/admin/coupons`).
- **User Management**: Overview of registered store customers and administrative roles.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router DOM v6, Lucide Icons, Vanilla CSS
- **Backend**: Node.js, Express.js, MySQL2, JWT Authentication, BcryptJS, Nodemailer
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose, Nginx

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm
- MySQL Server (v8.0+)
- Docker & Docker Compose (Optional)

### Option 1: Running with Docker (Recommended)
Launch the MySQL database, Express backend API, and React frontend with a single command:
```bash
docker-compose up --build
```
- **Storefront URL**: `http://localhost`
- **Backend API**: `http://localhost:5000`

---

### Option 2: Local Manual Setup

#### 1. Database Initialization
1. Create a MySQL database named `ecommerce_boutique`.
2. Import the schema and seed data:
```bash
mysql -u root -p ecommerce_boutique < database/schema.sql
mysql -u root -p ecommerce_boutique < database/seed.sql
```

#### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

#### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
The application will open on `http://localhost:5173`.

---

## 🧪 Running Tests

Run the unit and integration test suite:
```bash
cd server
npm test
```

---

## 🔑 Default Admin Account

- **Email**: `admin@boutique.com`
- **Password**: `admin123`
- **Admin Panel URL**: `http://localhost:5173/admin`
