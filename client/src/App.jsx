import React from 'react'
import { Routes, Route } from 'react-router-dom'
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
import AdminRoute from './components/AdminRoute'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import Product from './pages/Admin/Product'
import Orders from './pages/Admin/Orders'
import Users from './pages/Admin/Users'
import { useCart } from './context/CartContext'

function App() {
  const { isCartOpen, setIsCartOpen } = useCart();

  return (
    <div className="app-container">
      <Navbar />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main style={{ width: '100%', flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/about" element={<About />} />
          
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Product />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
