import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, updateSize, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page" style={{ padding: '4rem 2rem', maxW: '1200px', margin: '0 auto' }}>
      <div className="cart-page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingBag size={28} /> Shopping Cart
        </h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          {cartItems.length === 1 ? '1 item in your cart' : `${cartItems.length} items in your cart`}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart-view" style={{ textAlign: 'center', padding: '6rem 2rem', background: '#f9fafb', borderRadius: '12px' }}>
          <ShoppingBag size={64} style={{ margin: '0 auto 1.5rem', color: '#9ca3af' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your cart is empty</h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Add some premium items to get started.</p>
          <Link to="/shop" className="btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-page-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
          {/* Cart Items List */}
          <div className="cart-page-items" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map((item) => (
              <div 
                key={`${item.id}-${item.size}`} 
                className="cart-page-item" 
                style={{ 
                  display: 'flex', 
                  gap: '1.5rem', 
                  padding: '1.5rem', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  alignItems: 'center',
                  background: '#fff'
                }}
              >
                <div className="cart-item-image" style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div className="cart-item-details" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id, item.size)} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Color: <span style={{ fontWeight: 500, color: '#111827' }}>{item.color || 'Default'}</span></p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Size:</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['S', 'M', 'L', 'XL'].map(size => (
                        <button 
                          key={size}
                          className={`cart-size-btn ${item.size === size ? 'active' : ''}`}
                          onClick={() => updateSize(item.id, item.size, size)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            border: item.size === size ? '1px solid #111827' : '1px solid #e5e7eb',
                            backgroundColor: item.size === size ? '#111827' : '#fff',
                            color: item.size === size ? '#fff' : '#111827',
                            cursor: 'pointer',
                            fontWeight: 500
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div className="cart-item-quantity" style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                        style={{ padding: '6px 10px', border: 'none', background: '#f9fafb', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ padding: '0 12px', fontSize: '0.875rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        style={{ padding: '6px 10px', border: 'none', background: '#f9fafb', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar Summary */}
          <div className="cart-page-summary">
            <div 
              style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '12px', 
                padding: '2rem', 
                background: '#fff',
                position: 'sticky',
                top: '2rem'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                Order Summary
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1rem' }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1rem' }}>
                <span style={{ color: '#6b7280' }}>Shipping</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span>
              </div>

              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderTop: '1px solid #f3f4f6', 
                  paddingTop: '1.5rem', 
                  marginBottom: '2rem' 
                }}
              >
                <span style={{ fontSize: '1.125rem', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>${cartTotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout} 
                className="btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  fontWeight: 600, 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  cursor: 'pointer' 
                }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <Link to="/shop" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'underline' }}>
                  or Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
