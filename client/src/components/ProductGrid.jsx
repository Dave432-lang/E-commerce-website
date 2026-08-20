import React from 'react';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductGrid = ({ title, products }) => {
  const { addToCart } = useCart();
  return (
    <div className="product-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link to="/shop" className="view-all-link">View All Products</Link>
      </div>
      
      <div className="product-grid">
        {products.map((product) => {
          const stockQty = Number(product.stock_quantity ?? 50);
          const isOutOfStock = stockQty <= 0;
          const isLowStock = !isOutOfStock && stockQty <= 10;
          const regularPrice = Number(product.price);
          const salePrice = product.sale_price !== null && product.sale_price !== undefined ? Number(product.sale_price) : null;
          const isOnSale = salePrice !== null && salePrice > 0 && salePrice < regularPrice;

          return (
            <Link to={`/product/${product.id}`} key={product.id} className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`} style={{ textDecoration: 'none', color: 'inherit', position: 'relative' }}>
              <div className="product-image-container" style={{ position: 'relative' }}>
                <img src={product.image || product.image_url} alt={product.name} className="product-image" style={{ opacity: isOutOfStock ? 0.6 : 1 }} />
                
                {/* Badges */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 2 }}>
                  {isOutOfStock && (
                    <span style={{ background: '#ef4444', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Out of Stock
                    </span>
                  )}
                  {isLowStock && (
                    <span style={{ background: '#f59e0b', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Only {stockQty} Left!
                    </span>
                  )}
                  {!isOutOfStock && isOnSale && (
                    <span style={{ background: '#e5a93c', color: '#000000', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      SALE
                    </span>
                  )}
                  {!isOutOfStock && product.is_new_arrival && (
                    <span style={{ background: '#10b981', color: '#ffffff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      NEW
                    </span>
                  )}
                </div>

                <button className="wishlist-btn" onClick={(e) => { e.preventDefault(); }}>
                  <Heart size={20} />
                </button>

                <div className="product-overlay">
                  <button 
                    className="add-to-cart-btn" 
                    disabled={isOutOfStock}
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (!isOutOfStock) {
                        addToCart(product, 1, 'M');
                      }
                    }}
                    style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                  >
                    <ShoppingBag size={18} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
              
              <div className="product-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p className="product-category" style={{ marginBottom: 0 }}>{product.category} {product.gender ? `• ${product.gender.toUpperCase()}` : ''}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Star size={14} fill="currentColor" /> {product.rating || 4.8}
                  </div>
                </div>
                <h3 className="product-name">{product.name}</h3>
                
                <div className="product-price-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isOnSale ? (
                    <>
                      <span className="product-price" style={{ color: 'var(--primary, #e5a93c)', fontWeight: 700 }}>
                        GH₵{salePrice.toFixed(2)}
                      </span>
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        GH₵{regularPrice.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="product-price">
                      GH₵{regularPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
