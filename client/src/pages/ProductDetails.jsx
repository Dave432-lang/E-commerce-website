import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, ArrowLeft, Heart, MessageSquare, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { wishlistService } from '../services/wishlistService';
import { reviewService } from '../services/reviewService';
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

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const [productData, reviewsData] = await Promise.all([
          productService.getProductById(id),
          reviewService.getProductReviews(id)
        ]);
        setProduct(productData);
        setReviews(reviewsData);
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
      } catch (error) {
        console.error('Failed to load product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
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
    if (product && product.stock_quantity > 0) {
      addToCart(product, quantity, selectedSize);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError('Please enter a review comment.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const res = await reviewService.submitReview(product.id, newRating, newComment);
      setReviewSuccess('Thank you! Your review has been submitted.');
      setNewComment('');
      
      // Reload reviews and updated rating
      const updatedReviews = await reviewService.getProductReviews(product.id);
      setReviews(updatedReviews);
      if (res.newProductRating) {
        setProduct(prev => ({ ...prev, rating: res.newProductRating }));
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
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

  const stockCount = product.stock_quantity ?? 50;
  const isOutOfStock = stockCount <= 0;

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="product-category">{product.category}</p>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px', 
              backgroundColor: isOutOfStock ? '#fee2e2' : stockCount < 10 ? '#fef3c7' : '#dcfce7',
              color: isOutOfStock ? '#dc2626' : stockCount < 10 ? '#d97706' : '#16a34a'
            }}>
              {isOutOfStock ? 'Out of Stock' : stockCount < 10 ? `Low Stock: ${stockCount} left` : `In Stock (${stockCount} available)`}
            </span>
          </div>

          <h1 className="product-details-title">{product.name}</h1>

          <div className="product-details-rating">
            <div className="stars">{renderStars(product.rating)}</div>
            <span>{product.rating} Rating ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
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
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock}>+</button>
              </div>
            </div>
          </div>

          <div className="product-details-actions">
            <button
              className={`btn-primary add-to-cart-large ${addedToCart ? 'btn-success' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              <ShoppingBag size={20} />
              {isOutOfStock ? 'Out of Stock' : addedToCart ? 'Added!' : 'Add to Cart'}
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

      {/* Customer Reviews Section */}
      <div className="reviews-section" style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text)' }}>
          <MessageSquare size={22} className="icon-primary" /> Customer Reviews ({reviews.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          {/* Reviews List */}
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No reviews yet for this product. Be the first to write one!</p>
            ) : (
              <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{review.userName}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{review.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      {renderStars(review.rating)}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text)', lineHeight: '1.5' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Form */}
          <div>
            <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text)' }}>Write a Review</h3>

              {!user ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>log in</Link> to share your review.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  {reviewError && (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {reviewError}
                    </div>
                  )}
                  {reviewSuccess && (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      {reviewSuccess}
                    </div>
                  )}

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Rating</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Star
                            size={24}
                            fill={star <= newRating ? '#fbbf24' : 'none'}
                            color={star <= newRating ? '#fbbf24' : '#4b5563'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Your Review</label>
                    <textarea
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="What did you like or dislike about this product?"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.95rem', resize: 'vertical', outline: 'none' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submittingReview}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '50px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Send size={18} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
