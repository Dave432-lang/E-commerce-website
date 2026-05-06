import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Shop from './pages/Shop'
import { useCart } from './context/CartContext'

function App() {
  const { isCartOpen, setIsCartOpen } = useCart();

  return (
    <div className="app-container">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <main style={{ width: '100%', flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
