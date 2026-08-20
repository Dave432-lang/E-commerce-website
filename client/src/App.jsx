import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Shop from './pages/Shop'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TrackOrder from './pages/TrackOrder'
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import Product from './pages/Admin/Product'
import Orders from './pages/Admin/Orders'
import Users from './pages/Admin/Users'
import Coupons from './pages/Admin/Coupons'
import { useCart } from './context/CartContext'
import WhatsAppButton from './components/WhatsAppButton'

function App() {
  const { isCartOpen, setIsCartOpen } = useCart();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={isAdminRoute ? "admin-app-wrapper" : "app-container"}>
      {!isAdminRoute && <Navbar />}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main style={{ width: '100%', flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/women" element={<Shop key="women" initialDepartment="women" />} />
          <Route path="/men" element={<Shop key="men" initialDepartment="men" />} />
          <Route path="/new-arrivals" element={<Shop key="new" initialNewArrival={true} />} />
          <Route path="/sale" element={<Shop key="sale" initialOnSale={true} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Product />} />
            <Route path="orders" element={<Orders />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </main>

      {!isAdminRoute && <WhatsAppButton />}
      {!isAdminRoute && <Footer />}
    </div>
  )
}

export default App

