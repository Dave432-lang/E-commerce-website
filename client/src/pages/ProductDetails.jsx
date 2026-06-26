import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';
import Loader from '../components/Loader/Loader';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]); // Default to first size in stock
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedSize);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!product) {
    return (
      <div className="product-not-found" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h2>Product Not Found</h2>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <div className="back-link-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Collection
        </Link>
      </div>
      
      <div className="product-details-grid">
        {/* Product Image */}
        <div className="product-details-image">
          <img src={product.image} alt={product.name} />
        </div>

        {/* Product Info */}
        <div className="product-details-info">
          <p className="product-category">{product.category}</p>
          <h1 className="product-details-title">{product.name}</h1>
          
          <div className="product-details-rating">
            <div className="stars">
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
              <Star size={16} fill="#fbbf24" color="#fbbf24" />
            </div>
            <span>{product.rating} (124 Reviews)</span>
          </div>

          <p className="product-details-price">${Number(product.price).toFixed(2)}</p>

          <p className="product-details-description">
            {product.description || `Experience the perfect blend of comfort and premium aesthetics with this signature piece. 
            Designed with meticulous attention to detail, it features high-quality materials that ensure 
            durability while maintaining a sleek, modern silhouette. Perfect for elevating your everyday style.`}
          </p>

          <div className="product-options">
            {product.sizes && product.sizes.length > 0 && (
              <div className="size-selector">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Select Size</h4>
                </div>
                <div className="size-options">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSize(size);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="quantity-selector">
              <h4>Quantity</h4>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="product-details-actions">
            <button className="btn-primary add-to-cart-large" onClick={handleAddToCart}>
              <ShoppingBag size={20} /> Add to Cart
            </button>
            <button className="wishlist-btn-large">
              <Heart size={24} />
            </button>
          </div>

          <div className="product-meta">
            <p><strong>Free Shipping</strong> on orders over $150</p>
            <p><strong>Returns:</strong> Accepted within 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
