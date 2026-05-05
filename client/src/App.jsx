import React from 'react'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div style={{ marginTop: '5rem', textAlign: 'center' }}>
        <h1 className="hero-title">Boutique</h1>
        <p className="hero-subtitle">Discover curated fashion and premium aesthetics tailored for you.</p>
      </div>
    </div>
  )
}

export default App
