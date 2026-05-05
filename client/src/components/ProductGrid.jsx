import React from 'react';
import { ShoppingBag, Heart } from 'lucide-react';

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
              <p className="product-category">{product.category}</p>
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
