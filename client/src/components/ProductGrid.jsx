import React from 'react';
import { ShoppingBag, Heart } from 'lucide-react';

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: 'Minimalist Leather Jacket',
    price: 299.99,
    category: 'Outerwear',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    name: 'Silk Blend Slip Dress',
    price: 189.00,
    category: 'Dresses',
    image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    name: 'Oversized Wool Sweater',
    price: 145.50,
    category: 'Knitwear',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    name: 'Tailored Wide-Leg Trousers',
    price: 120.00,
    category: 'Bottoms',
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

const ProductGrid = () => {
  return (
    <div className="product-section">
      <div className="section-header">
        <h2 className="section-title">Featured Collection</h2>
        <a href="#" className="view-all-link">View All Products</a>
      </div>
      
      <div className="product-grid">
        {DUMMY_PRODUCTS.map((product) => (
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
