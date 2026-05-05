import React from 'react';
import { ShoppingBag, Heart, Star } from 'lucide-react';

const ProductGrid = ({ title, products }) => {
  return (
    <div className="product-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <a href="#" className="view-all-link">View All Products</a>
      </div>
      
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image-container">
              <img src={product.image} alt={product.name} className="product-image" />
              <button className="wishlist-btn">
                <Heart size={20} />
              </button>
              <div className="product-overlay">
                <button className="add-to-cart-btn">
                  <ShoppingBag size={18} /> Add to Cart
                </button>
              </div>
            </div>
            <div className="product-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <p className="product-category" style={{ marginBottom: 0 }}>{product.category}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Star size={14} fill="currentColor" /> {product.rating}
                </div>
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
