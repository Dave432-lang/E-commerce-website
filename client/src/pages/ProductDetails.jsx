import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { wishlistService } from '../services/wishlistService';
import Loader from '../components/Loader/Loader';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Check if product is in wishlist when user is logged in
  useEffect(() => {
    if (!user || !product) return;

    const checkWishlist = async () => {
      try {
        const wishlistItems = await wishlistService.getWishlist();
        setInWishlist(wishlistItems.some(item => item.id === product.id));
      } catch (error) {
        console.error('Failed to check wishlist status:', error);
      }
    };

    checkWishlist();
  }, [user, product]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedSize);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      // Redirect to login with a message
      return;
    }

    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setInWishlist(false);
      } else {
        await wishlistService.addToWishlist(product.id);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setWishlistLoading(false);
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

  // Render star rating based on actual product rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < Math.round(rating) ? '#fbbf24' : 'none'}
        color={i < Math.round(rating) ? '#fbbf24' : '#d1d5db'}
      />
    ));
  };

  return (
    <div className="product-details-page">
      <div className="back-link-container">
        <Link to="/shop" className="back-link">
          <ArrowLeft size={16} /> Back to Shop
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
            <div className="stars">{renderStars(product.rating)}</div>
            <span>{product.rating} Rating</span>
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
                      onClick={() => setSelectedSize(size)}
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
            <button
              className={`btn-primary add-to-cart-large ${addedToCart ? 'btn-success' : ''}`}
              onClick={handleAddToCart}
            >
              <ShoppingBag size={20} />
              {addedToCart ? 'Added!' : 'Add to Cart'}
            </button>
            <button
              className={`wishlist-btn-large ${inWishlist ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              title={user ? (inWishlist ? 'Remove from wishlist' : 'Add to wishlist') : 'Login to save to wishlist'}
            >
              <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {!user && (
            <p className="wishlist-login-hint">
              <Link to="/login">Log in</Link> to save items to your wishlist.
            </p>
          )}

          <div className="product-meta">
            <p><strong>Free Shipping</strong> on all orders within Ghana</p>
            <p><strong>Returns:</strong> Accepted within 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
