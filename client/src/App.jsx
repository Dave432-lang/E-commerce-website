import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProductGrid from './components/ProductGrid'
import Footer from './components/Footer'
import { newArrivals, bestSellers, trendingNow } from './utils/dummyData'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <ProductGrid title="New Arrivals" products={newArrivals} />
      <ProductGrid title="Best Sellers" products={bestSellers} />
      <ProductGrid title="Trending Now" products={trendingNow} />
      <Footer />
    </div>
  )
}

export default App
